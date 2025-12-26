from rest_framework import serializers
from .models import Event, Enrollment
from django.utils import timezone

class EventSerializer(serializers.ModelSerializer):
    created_by_email = serializers.ReadOnlyField(source='created_by.email')
    available_seats = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'language', 'location', 
            'starts_at', 'ends_at', 'capacity', 'available_seats',
            'enrolled_count', 'is_enrolled',
            'created_by_email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by_email', 'created_at', 'updated_at', 'available_seats', 'enrolled_count', 'is_enrolled']

    def get_available_seats(self, obj):
        return obj.available_seats

    def get_enrolled_count(self, obj):
        """Return the total number of enrolled users for this event"""
        return obj.enrollments.filter(status='ENROLLED').count()

    def get_is_enrolled(self, obj):
        """Check if the current user is enrolled in this event"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(seeker=request.user, status='ENROLLED').exists()
        return False

    def validate(self, data):
        if data['starts_at'] >= data['ends_at']:
            raise serializers.ValidationError("End time must be after start time.")
        return data

class EnrollmentSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')
    event_starts_at = serializers.ReadOnlyField(source='event.starts_at')

    class Meta:
        model = Enrollment
        fields = ['id', 'event', 'event_title', 'event_starts_at', 'status', 'created_at']
        read_only_fields = ['seeker', 'status', 'created_at']

    def create(self, validated_data):
        event = validated_data['event']
        seeker = self.context['request'].user
        
        enrollment = Enrollment.objects.filter(event=event, seeker=seeker).first()
        
        if enrollment:
            if enrollment.status == 'ENROLLED':
                raise serializers.ValidationError("You are already enrolled in this event.")
            # Re-enroll
            if not event.check_capacity:
                raise serializers.ValidationError("Event is full.")
            enrollment.status = 'ENROLLED'
            enrollment.save()
            return enrollment
        
        # New enrollment
        if not event.check_capacity:
            raise serializers.ValidationError("Event is full.")
            
        validated_data['seeker'] = seeker
        return super().create(validated_data)
