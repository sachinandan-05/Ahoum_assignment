from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    language = models.CharField(max_length=50) # e.g. English, French
    location = models.CharField(max_length=255)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    capacity = models.PositiveIntegerField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['starts_at']),
            models.Index(fields=['language']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return self.title

    @property
    def check_capacity(self):
        if self.capacity is None:
            return True
        return self.enrollments.filter(status='ENROLLED').count() < self.capacity

    @property
    def available_seats(self):
        if self.capacity is None:
            return None
        return self.capacity - self.enrollments.filter(status='ENROLLED').count()


class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('ENROLLED', 'Enrolled'),
        ('CANCELED', 'Canceled'),
    )

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='enrollments')
    seeker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ENROLLED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('event', 'seeker') # Logic needs to refine this: "cannot enroll twice in same event (active)"
        # Uniqueness constraint: (event, seeker) is simple DB uniqueness.
        # But if they cancel and re-enroll? 'unique_together' prevents duplicate rows.
        # If they cancel, we might update status to CANCELED. If they re-enroll, we update back to ENROLLED?
        # Or we allow multiple rows (history)?
        # Spec says: "cannot enroll the same seeker twice in the same event (active)."
        # Better to just use unique_together and update the rows.

    def __str__(self):
        return f"{self.seeker.email} -> {self.event.title}"
