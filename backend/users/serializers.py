from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer to expose authenticated user profile details
    to the frontend /auth/me/ endpoint.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar_url', 'role', 'provider', 'has_completed_onboarding')
        read_only_fields = fields
