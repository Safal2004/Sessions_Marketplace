from rest_framework import serializers
from django.contrib.auth import get_user_model
from sessions_app.models import Session
from bookings.models import Booking

User = get_user_model()

class PaymentCreateOrderSerializer(serializers.Serializer):
    """
    Serializer to validate incoming session orders before invoking Razorpay APIs.
    """
    session_id = serializers.UUIDField(required=True)

    def validate_session_id(self, value):
        # 1. Exist check
        try:
            session = Session.objects.get(id=value)
        except Session.DoesNotExist:
            raise serializers.ValidationError("The selected session does not exist.")

        # 2. Published check
        if not session.is_published:
            raise serializers.ValidationError("Cannot book an unpublished session.")

        request = self.context.get('request')
        if request and request.user:
            user = request.user
            
            # 3. Creator check
            if session.creator == user:
                raise serializers.ValidationError("Creators cannot book their own sessions.")

            # 4. Duplicate check
            if Booking.objects.filter(user=user, session=session, status='confirmed').exists():
                raise serializers.ValidationError("You have already booked this session.")

            # 5. Capacity check
            if session.is_full:
                raise serializers.ValidationError("This session is already full. No remaining seats.")

        return value


class PaymentVerifySerializer(serializers.Serializer):
    """
    Serializer to accept signature payload and confirm booking generation.
    """
    razorpay_order_id = serializers.CharField(required=True)
    razorpay_payment_id = serializers.CharField(required=True)
    razorpay_signature = serializers.CharField(required=True)
    session_id = serializers.UUIDField(required=True)

    def validate_session_id(self, value):
        try:
            Session.objects.get(id=value)
        except Session.DoesNotExist:
            raise serializers.ValidationError("Session does not exist.")
        return value
