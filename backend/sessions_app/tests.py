from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Session

User = get_user_model()

class SessionAPITests(APITestCase):

    def setUp(self):
        # Create users with different roles
        self.creator_user = User.objects.create_user(
            username='creator_alice',
            email='alice@example.com',
            password='password123',
            role='creator'
        )
        self.other_creator = User.objects.create_user(
            username='creator_bob',
            email='bob@example.com',
            password='password123',
            role='creator'
        )
        self.normal_user = User.objects.create_user(
            username='user_charlie',
            email='charlie@example.com',
            password='password123',
            role='user'
        )

        # Create sample sessions
        self.published_session = Session.objects.create(
            creator=self.creator_user,
            title='Guitar Lesson for Beginners',
            description='Learn essential guitar chords and strumming techniques.',
            price=29.99,
            duration_minutes=45,
            max_participants=5,
            is_published=True,
            tags='music,guitar'
        )

        self.unpublished_session = Session.objects.create(
            creator=self.creator_user,
            title='Advanced Python Patterns',
            description='Deep dive into meta-programming and async execution.',
            price=99.00,
            duration_minutes=90,
            max_participants=2,
            is_published=False,
            tags='coding,python'
        )

        self.list_url = reverse('session-list')
        self.published_detail_url = reverse('session-detail', kwargs={'pk': self.published_session.id})
        self.unpublished_detail_url = reverse('session-detail', kwargs={'pk': self.unpublished_session.id})

    # ==========================================
    # 1. READ / VISIBILITY TESTS
    # ==========================================

    def test_anonymous_user_can_list_only_published_sessions(self):
        """
        Unauthenticated users should only be able to retrieve published sessions.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check pagination structure
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should only find the 1 published session
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], self.published_session.title)

    def test_anonymous_user_can_retrieve_published_session_details(self):
        response = self.client.get(self.published_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.published_session.title)

    def test_anonymous_user_blocked_from_retrieving_unpublished_session(self):
        response = self.client.get(self.unpublished_detail_url)
        self.assertEqual(response.status_code, status.HTTP_444_NOT_FOUND if hasattr(status, 'HTTP_444_NOT_FOUND') else status.HTTP_404_NOT_FOUND)

    def test_creator_can_retrieve_their_own_unpublished_session(self):
        self.client.force_authenticate(user=self.creator_user)
        response = self.client.get(self.unpublished_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.unpublished_session.title)

    def test_creator_blocked_from_retrieving_other_creators_unpublished_session(self):
        self.client.force_authenticate(user=self.other_creator)
        response = self.client.get(self.unpublished_detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ==========================================
    # 2. WRITE / CREATOR ROLE PERMISSIONS TESTS
    # ==========================================

    def test_creator_user_can_create_session(self):
        self.client.force_authenticate(user=self.creator_user)
        data = {
            'title': 'React App Building',
            'description': 'Let\'s build a clean React application together.',
            'price': 49.99,
            'duration_minutes=60': 60,  # Note field mapping
            'duration_minutes': 60,
            'max_participants': 3,
            'is_published': True,
            'tags': 'react,web'
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'React App Building')
        # Check auto-assignment of creator
        session = Session.objects.get(id=response.data['id'])
        self.assertEqual(session.creator, self.creator_user)

    def test_normal_user_blocked_from_creating_session(self):
        self.client.force_authenticate(user=self.normal_user)
        data = {
            'title': 'Hacking UI Layouts',
            'description': 'Designing neat interfaces.',
            'price': 10.00,
            'duration_minutes': 30,
            'max_participants': 10
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_user_blocked_from_creating_session(self):
        data = {
            'title': 'Hacking UI Layouts',
            'description': 'Designing neat interfaces.',
            'price': 10.00,
            'duration_minutes': 30,
            'max_participants': 10
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ==========================================
    # 3. OWNER MUTATION PERMISSIONS TESTS
    # ==========================================

    def test_owner_creator_can_update_session(self):
        self.client.force_authenticate(user=self.creator_user)
        data = {'title': 'Updated Guitar Lesson title'}
        response = self.client.patch(self.published_detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Guitar Lesson title')

    def test_other_creator_blocked_from_updating_session(self):
        self.client.force_authenticate(user=self.other_creator)
        data = {'title': 'Bob tries to hack the title'}
        response = self.client.patch(self.published_detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_creator_can_delete_session(self):
        self.client.force_authenticate(user=self.creator_user)
        response = self.client.delete(self.published_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Session.objects.filter(id=self.published_session.id).exists())

    # ==========================================
    # 4. FIELD VALIDATION TESTS
    # ==========================================

    def test_price_cannot_be_negative(self):
        self.client.force_authenticate(user=self.creator_user)
        data = {
            'title': 'Broken Pricing',
            'description': 'Pricing is negative.',
            'price': -5.00,
            'duration_minutes': 30,
            'max_participants': 1
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)

    def test_duration_must_be_positive(self):
        self.client.force_authenticate(user=self.creator_user)
        data = {
            'title': 'Broken Duration',
            'description': 'Duration is zero.',
            'price': 10.00,
            'duration_minutes': 0,
            'max_participants': 1
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('duration_minutes', response.data)
