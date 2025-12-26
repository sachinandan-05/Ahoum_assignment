import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import Profile
from events.models import Event, Enrollment
from django.utils import timezone
from datetime import timedelta

@pytest.mark.django_db
class TestEvents:
    def setup_method(self):
        self.client = APIClient()
        
        # Create Facilitator
        self.facilitator_user = User.objects.create_user(username='fac', email='fac@test.com', password='password')
        Profile.objects.create(user=self.facilitator_user, role='FACILITATOR', is_verified=True)
        
        # Create Seeker
        self.seeker_user = User.objects.create_user(username='see', email='see@test.com', password='password')
        Profile.objects.create(user=self.seeker_user, role='SEEKER', is_verified=True)

        self.events_url = reverse('event-list')

    def test_create_event_facilitator(self):
        self.client.force_authenticate(user=self.facilitator_user)
        # Ensure url is correct; router uses 'event-list' usually or 'events-list' if basename is 'event'
        # DefaultRouter with basename='event' -> 'event-list'
        
        now = timezone.now()
        data = {
            "title": "Python Workshop",
            "description": "Learn Django",
            "language": "English",
            "location": "Online",
            "starts_at": (now + timedelta(days=1)).isoformat(),
            "ends_at": (now + timedelta(days=1, hours=2)).isoformat(),
            "capacity": 10
        }
        response = self.client.post(self.events_url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Event.objects.count() == 1
        assert Event.objects.first().created_by == self.facilitator_user

    def test_create_event_seeker_forbidden(self):
        self.client.force_authenticate(user=self.seeker_user)
        now = timezone.now()
        data = {
            "title": "Hacker Event",
            "description": "Should fail",
            "language": "English",
            "location": "Online",
            "starts_at": (now + timedelta(days=1)).isoformat(),
            "ends_at": (now + timedelta(days=1, hours=2)).isoformat(),
        }
        response = self.client.post(self.events_url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_events(self):
        # Create an event
        Event.objects.create(
            title="Public Event",
            description="Everyone welcome",
            language="English",
            location="NY",
            starts_at=timezone.now() + timedelta(days=2),
            ends_at=timezone.now() + timedelta(days=2, hours=1),
            created_by=self.facilitator_user
        )
        
        self.client.force_authenticate(user=self.seeker_user)
        response = self.client.get(self.events_url)
        assert response.status_code == status.HTTP_200_OK
        # Pagination enabled
        assert len(response.data['results']) == 1

@pytest.mark.django_db
class TestEnrollment:
    def setup_method(self):
        self.client = APIClient()
        self.facilitator = User.objects.create_user(username='f', email='f@t.com', password='p')
        Profile.objects.create(user=self.facilitator, role='FACILITATOR', is_verified=True)
        
        self.seeker = User.objects.create_user(username='s', email='s@t.com', password='p')
        Profile.objects.create(user=self.seeker, role='SEEKER', is_verified=True)
        
        self.event = Event.objects.create(
            title="Test Event",
            description="Desc",
            language="English",
            location="Web",
            starts_at=timezone.now() + timedelta(days=1),
            ends_at=timezone.now() + timedelta(days=1, hours=2),
            created_by=self.facilitator,
            capacity=1
        )
        
    def test_enroll_success(self):
        self.client.force_authenticate(user=self.seeker)
        url = reverse('event-enroll', args=[self.event.id])
        response = self.client.post(url)
        assert response.status_code == status.HTTP_201_CREATED
        assert Enrollment.objects.count() == 1
        assert Enrollment.objects.first().status == 'ENROLLED'
        
    def test_enroll_capacity_fail(self):
        # Fill capacity first
        other_seeker = User.objects.create_user(username='s2', email='s2@t.com', password='p')
        Enrollment.objects.create(event=self.event, seeker=other_seeker, status='ENROLLED')
        
        self.client.force_authenticate(user=self.seeker)
        url = reverse('event-enroll', args=[self.event.id])
        response = self.client.post(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "full" in str(response.data) # Check error message contains 'full'

    def test_double_enrollment(self):
        Enrollment.objects.create(event=self.event, seeker=self.seeker, status='ENROLLED')
        
        self.client.force_authenticate(user=self.seeker)
        url = reverse('event-enroll', args=[self.event.id])
        response = self.client.post(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already enrolled" in str(response.data)

    def test_cancel_enrollment_success(self):
        """Test that a seeker can cancel their enrollment"""
        # First enroll
        Enrollment.objects.create(event=self.event, seeker=self.seeker, status='ENROLLED')
        
        self.client.force_authenticate(user=self.seeker)
        url = reverse('event-cancel-enrollment', args=[self.event.id])
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_200_OK
        
        # Check enrollment status is now canceled
        enrollment = Enrollment.objects.get(event=self.event, seeker=self.seeker)
        assert enrollment.status == 'CANCELED'

    def test_cancel_enrollment_not_enrolled(self):
        """Test canceling enrollment when not enrolled fails"""
        self.client.force_authenticate(user=self.seeker)
        url = reverse('event-cancel-enrollment', args=[self.event.id])
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_event_enrolled_count(self):
        """Test that enrolled_count field is returned correctly"""
        # Create another seeker and enroll both
        seeker2 = User.objects.create_user(username='s2', email='s2@t.com', password='p')
        Profile.objects.create(user=seeker2, role='SEEKER', is_verified=True)
        
        # Increase capacity
        self.event.capacity = 10
        self.event.save()
        
        Enrollment.objects.create(event=self.event, seeker=self.seeker, status='ENROLLED')
        Enrollment.objects.create(event=self.event, seeker=seeker2, status='ENROLLED')
        
        self.client.force_authenticate(user=self.seeker)
        url = reverse('event-detail', args=[self.event.id])
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['enrolled_count'] == 2
        assert response.data['is_enrolled'] == True
        assert response.data['available_seats'] == 8

    def test_event_is_enrolled_false_when_not_enrolled(self):
        """Test is_enrolled is False when user is not enrolled"""
        self.client.force_authenticate(user=self.seeker)
        url = reverse('event-detail', args=[self.event.id])
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_enrolled'] == False
