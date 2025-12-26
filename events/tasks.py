from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from .models import Event, Enrollment
from datetime import timedelta

@shared_task
def send_followup_email(user_email, event_title):
    subject = f"Thanks for enrolling in {event_title}"
    message = "We hope you are excited! This is a follow-up 1 hour after your enrollment."
    send_mail(subject, message, 'admin@events.com', [user_email])

@shared_task
def check_event_reminders():
    # Runs periodically (e.g. every 5 mins)
    # Find events starting between 55 mins and 65 mins from now (approx 1 hour)
    now = timezone.now()
    start_window = now + timedelta(minutes=55)
    end_window = now + timedelta(minutes=65)
    
    events = Event.objects.filter(starts_at__range=(start_window, end_window))
    
    for event in events:
        # Find enrollments
        enrollments = Enrollment.objects.filter(event=event, status='ENROLLED')
        for enrollment in enrollments:
            send_reminder_email.delay(enrollment.seeker.email, event.title)

@shared_task
def send_reminder_email(user_email, event_title):
    subject = f"Reminder: {event_title} starts in 1 hour!"
    message = f"Get ready, your event {event_title} is starting soon."
    send_mail(subject, message, 'admin@events.com', [user_email])
