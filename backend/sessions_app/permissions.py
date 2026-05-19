from rest_framework import permissions

class IsCreatorRole(permissions.BasePermission):
    """
    Custom permission that permits access only to users with the 'creator' role.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'creator'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission that permits read-only access for anyone,
    but restricts write operations (PUT, PATCH, DELETE) to the session's creator.
    """
    def has_object_permission(self, request, view, obj):
        # Allow SAFE_METHODS (GET, HEAD, OPTIONS) for anyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Restrict mutation methods to the creator who owns this session
        return (
            request.user and 
            request.user.is_authenticated and 
            obj.creator == request.user
        )
