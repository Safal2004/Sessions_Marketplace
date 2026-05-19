from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from sessions_app.models import Session
from .models import Booking

User = get_user_model()

class BookingAPITests(APITestCase):

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
        self.other_attendee = User.objects.create_user(
            username='user_david',
            email='david@example.com',
            password='password123',
            role='user'
        )

        # Create published session
        self.session = Session.objects.create(
            creator=self.creator_user,
            title='Intro to Systems Design',
            description='High-level architectural analysis overview.',
            price=50.00,
            duration_minutes=60,
            max_participants=2,
            is_published=True
        )

        # Create unpublished session
        self.unpublished_session = Session.objects.create(
            creator=self.creator_user,
            title='Secret Project details',
            description='Unpublished details.',
            price=10.00,
            duration_minutes=30,
            max_participants=10,
            is_published=False
        )

        self.list_url = reverse('booking-list')
        self.summary_url = reverse('booking-dashboard-summary')

    # ==========================================
    # 1. VISIBILITY / SECURITY TESTS
    # ==========================================

    def test_anonymous_user_blocked_from_booking(self):
        response = self.client.post(self.list_url, {'session_id': str(self.session.id)})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_booking(self):
        self.client.force_authenticate(user=self.attendee_user)
        response = self.client.post(self.list_url, {'session_id': str(self.session.id)})
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Booking.objects.filter(user=self.attendee_user, session=self.session).exists())
        
        # Verify dynamic capacity count updates
        self.session.refresh_from_db()
        self.assertEqual(self.session.confirmed_bookings_count, 1)
        self.assertEqual(self.session.remaining_seats, 1)
        self.assertFalse(self.session.is_full)

    # ==========================================
    # 2. VALIDATION RULE TESTS
    # ==========================================

    def test_creator_blocked_from_booking_own_session(self):
        self.client.force_authenticate(user=self.creator_user)
        response = self.client.post(self.list_url, {'session_id': str(self.session.id)})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Creators cannot book their own sessions.', str(response.data))

    def test_user_blocked_from_booking_unpublished_session(self):
        self.client.force_authenticate(user=self.attendee_user)
        response = self.client.post(self.list_url, {'session_id': str(self.unpublished_session.id)})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot book an unpublished session.', str(response.data))

    def test_prevent_duplicate_bookings(self):
        self.client.force_authenticate(user=self.attendee_user)
        # Create first booking
        self.client.post(self.list_url, {'session_id': str(self.session.id)})
        
        # Try to duplicate
        response = self.client.post(self.list_url, {'session_id': str(self.session.id)})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You have already booked this session.', str(response.data))

    def test_prevent_booking_if_session_is_full(self):
        # Fill capacity (capacity = 2)
        Booking.objects.create(user=self.attendee_user, session=self.session, status='confirmed')
        Booking.objects.create(user=self.other_attendee, session=self.session, status='confirmed')
        
        # Confirm full state
        self.session.refresh_from_db()
        self.assertTrue(self.session.is_full)
        self.assertEqual(self.session.remaining_seats, 0)

        # Try to book third seat
        third_user = User.objects.create_user(
            username='user_edward',
            email='edward@example.com',
            password='password123',
            role='user'
        )
        self.client.force_authenticate(user=third_user)
        response = self.client.post(self.list_url, {'session_id': str(self.session.id)})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('This session is already full.', str(response.data))

    # ==========================================
    # 3. OWNER ISOLATION TESTS
    # ==========================================

    def test_user_can_only_see_their_own_bookings(self):
        # Attendee bookings
        Booking.objects.create(user=self.attendee_user, session=self.session, status='confirmed')
        # David bookings
        Booking.objects.create(user=self.other_attendee, session=self.session, status='confirmed')

        # Log in as David
        self.client.force_authenticate(user=self.other_attendee)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        # Should only list David's 1 booking
        self.assertEqual(len(results), 1)

    def test_dashboard_summary_endpoint(self):
        Booking.objects.create(user=self.attendee_user, session=self.session, status='confirmed')
        
        self.client.force_authenticate(user=self.attendee_user)
        response = self.client.get(self.summary_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_bookings'], 1)
        self.assertEqual(response.data['confirmed_bookings'], 1)
        self.assertEqual(response.data['cancelled_bookings'], 0)
