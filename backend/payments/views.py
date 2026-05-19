import razorpay
from django.conf import settings
from rest_framework import views, permissions, status
from rest_framework.response import Response
from sessions_app.models import Session
from bookings.models import Booking
from .serializers import PaymentCreateOrderSerializer, PaymentVerifySerializer

class PaymentCreateOrderView(views.APIView):
    """
    API View to validate user requests, calculate prices in paise/cents, 
    and invoke Razorpay Order APIs (or auto-bypass if free).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PaymentCreateOrderSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        session_id = serializer.validated_data['session_id']
        session = Session.objects.get(id=session_id)

        # Handle free session bypass
        if float(session.price) == 0:
            # Create booking instantly
            booking, created = Booking.objects.get_or_create(
                user=request.user, 
                session=session, 
                defaults={'status': 'confirmed'}
            )
            return Response({
                'is_free': True,
                'status': 'confirmed',
                'booking_id': str(booking.id),
                'detail': 'Free session booked successfully without payments.'
            }, status=status.HTTP_201_CREATED)

        # Instanstiate Razorpay client
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        try:
            # Amount in paise (Razorpay expects INR currency by default in standard test accounts)
            amount_paise = int(float(session.price) * 100)
            order_payload = {
                'amount': amount_paise,
                'currency': 'INR',
                'payment_capture': 1
            }

            razorpay_order = client.order.create(data=order_payload)

            return Response({
                'is_free': False,
                'order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'razorpay_key': settings.RAZORPAY_KEY_ID
            }, status=status.HTTP_200_OK)

        except Exception as e:
            console_log = getattr(settings, 'DEBUG', False)
            if console_log:
                print("Razorpay order creation failed:", str(e))
            return Response({
                'detail': 'Failed to instantiate Razorpay orders. Please check secret configuration settings.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentVerifyView(views.APIView):
    """
    API View to verify payment signatures and securely confirm seat bookings.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PaymentVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['razorpay_order_id']
        payment_id = serializer.validated_data['razorpay_payment_id']
        signature = serializer.validated_data['razorpay_signature']
        session_id = serializer.validated_data['session_id']

        session = Session.objects.get(id=session_id)

        # Instanstiate client
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        # Securely verify payment signature
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }

        try:
            client.utility.verify_payment_signature(params_dict)
        except Exception as e:
            return Response({
                'detail': 'Payment verification failed. Invalid transaction signature.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Race condition capacity check
        if session.is_full:
            return Response({
                'detail': 'Capacity exceeded while processing payment. This session is now fully booked.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create the confirmed booking securely
        booking, created = Booking.objects.get_or_create(
            user=request.user,
            session=session,
            defaults={'status': 'confirmed'}
        )

        return Response({
            'status': 'success',
            'booking_id': str(booking.id),
            'detail': 'Payment verified and reservation successfully scheduled!'
        }, status=status.HTTP_200_OK)
