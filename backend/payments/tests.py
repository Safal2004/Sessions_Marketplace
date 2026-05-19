from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from sessions_app.models import Session
from bookings.models import Booking

User = get_user_model()

class PaymentAPITests(APITestCase):

    def setUp(self):
        # Create users
        self.creator_user = User.objects.create_user(
            username='creator_alice',
            email='alice@example.com',
            password='password123',
            role='creator'
        )
        self.attendee_user = User.objects.create_user(
            username='user_charlie',
            email='charlie@example.com',
            password='password123',
            role='user'
        )

        # Create paid session
        self.paid_session = Session.objects.create(
            creator=self.creator_user,
            title='Intro to Cloud Scaling',
            description='PAID high-level scaling session.',
            price=99.00,
            duration_minutes=60,
            max_participants=5,
            is_published=True
        )

        # Create free session
        self.free_session = Session.objects.create(
            creator=self.creator_user,
            title='Free Masterclass',
            description='FREE high-level coding session.',
            price=0.00,
            duration_minutes=30,
            max_participants=5,
            is_published=True
        )

        self.create_order_url = reverse('payment_create_order')
        self.verify_url = reverse('payment_verify')

    # ==========================================
    # 1. ORDER CREATION TESTS & FREE BYPASS
    # ==========================================

    @patch('razorpay.Client')
    def test_paid_session_creates_razorpay_order_successfully(self, mock_razorpay):
        # Mock Razorpay order client response
        mock_client = MagicMock()
        mock_client.order.create.return_value = {
            'id': 'order_mock12345',
            'amount': 9900,
            'currency': 'INR'
        }
        mock_razorpay.return_value = mock_client

        self.client.force_authenticate(user=self.attendee_user)
        response = self.client.post(self.create_order_url, {'session_id': str(self.paid_session.id)})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_free'])
        self.assertEqual(response.data['order_id'], 'order_mock12345')
        self.assertEqual(response.data['amount'], 9900)

    def test_free_session_bypasses_checkout_and_creates_booking(self):
        self.client.force_authenticate(user=self.attendee_user)
        response = self.client.post(self.create_order_url, {'session_id': str(self.free_session.id)})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['is_free'])
        self.assertEqual(response.data['status'], 'confirmed')
        self.assertTrue(Booking.objects.filter(user=self.attendee_user, session=self.free_session).exists())

    # ==========================================
    # 2. SIGNATURE VERIFICATION TESTS
    # ==========================================

    @patch('razorpay.Client')
    def test_payment_verification_creates_confirmed_booking(self, mock_razorpay):
        # Mock successful signature check
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = True
        mock_razorpay.return_value = mock_client

        self.client.force_authenticate(user=self.attendee_user)
        payload = {
            'razorpay_order_id': 'order_mock12345',
            'razorpay_payment_id': 'pay_mock12345',
            'razorpay_signature': 'sig_mock12345',
            'session_id': str(self.paid_session.id)
        }
        response = self.client.post(self.verify_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertTrue(Booking.objects.filter(user=self.attendee_user, session=self.paid_session, status='confirmed').exists())

    @patch('razorpay.Client')
    def test_failed_signature_returns_bad_request(self, mock_razorpay):
        # Mock failed signature check
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.side_effect = Exception("Signature verification failed")
        mock_razorpay.return_value = mock_client

        self.client.force_authenticate(user=self.attendee_user)
        payload = {
            'razorpay_order_id': 'order_mock12345',
            'razorpay_payment_id': 'pay_mock12345',
            'razorpay_signature': 'invalid_sig',
            'session_id': str(self.paid_session.id)
        }
        response = self.client.post(self.verify_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Payment verification failed.', str(response.data))
        self.assertFalse(Booking.objects.filter(user=self.attendee_user, session=self.paid_session).exists())
