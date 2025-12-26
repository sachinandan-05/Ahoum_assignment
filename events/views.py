from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Event, Enrollment
from .serializers import EventSerializer, EnrollmentSerializer
from .permissions import IsFacilitator, IsSeeker, IsEventOwner
from .filters import EventFilter
from .tasks import send_followup_email

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('starts_at') # Default ordering 'upcoming first' (closest start time)
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = EventFilter
    ordering_fields = ['starts_at', 'created_at']

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated, IsFacilitator]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsFacilitator, IsEventOwner]
        else: # list, retrieve
            permission_classes = [permissions.IsAuthenticated] # Seekers and Facilitators can view
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsFacilitator])
    def my_events(self, request):
        # Facilitator: List my events with counts
        events = Event.objects.filter(created_by=request.user)
        # Counts are properties in model/serializer (available_seats), or can annotate
        # Model has available_seats property. Total enrollments needed?
        # Serializer doesn't have total_enrollments field. Let's add it dynamically or just use the model property if we added one.
        # Simplest: use standard serializer which has available_seats, and maybe update serializer to include 'total_enrollments'
        
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsSeeker])
    def enroll(self, request, pk=None):
        event = self.get_object()
        serializer = EnrollmentSerializer(data={'event': event.id}, context={'request': request})
        if serializer.is_valid():
            enrollment = serializer.save()
            # Bonus: Send follow-up email 1 hour later
            # We assume enrollment object was returned.
            # If it was an existing enrollment updated, we might not want to re-send?
            # Serializer create updates status if re-enrolling.
            # Let's send it anyway or check created_at? 
            # Simple approach: schedule it.
            send_followup_email.apply_async(
                args=[request.user.email, event.title],
                countdown=3600 # 1 hour
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return Enrollment.objects.filter(seeker=self.request.user)

    @action(detail=False, methods=['get'])
    def past(self, request):
        # Events already ended
        now = timezone.now()
        enrollments = self.get_queryset().filter(event__ends_at__lt=now)
        page = self.paginate_queryset(enrollments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        now = timezone.now()
        # Events starting in future? Or generally "Active" enrollments where event hasn't ended? 
        # Usually upcoming means starts_at > now.
        enrollments = self.get_queryset().filter(event__starts_at__gt=now).order_by('event__starts_at')
        page = self.paginate_queryset(enrollments)
        if page is not None:
             serializer = self.get_serializer(page, many=True)
             return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
