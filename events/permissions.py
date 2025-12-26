from rest_framework import permissions

class IsFacilitator(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if user is authenticated and has a profile with 'FACILITATOR' role
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.is_facilitator()

class IsSeeker(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.is_seeker()

class IsEventOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (if logic requires, but usually Facilitators see their own?)
        # Spec: "Facilitator Features: List my events". "Seeker Features: Search events".
        # So Seekers can VIEW all events.
        # But for Update/Delete, only owner.
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.created_by == request.user
