from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Session

User = get_user_model()

class CreatorSerializer(serializers.ModelSerializer):
    """
    Lightweight nested serializer to expose creator profile details.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar_url', 'role')
        read_only_fields = fields


class SessionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer optimized for listing sessions with light payloads.
    """
    creator = CreatorSerializer(read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = (
            'id', 'creator', 'title', 'thumbnail_url', 
            'price', 'duration_minutes', 'max_participants', 
            'is_published', 'tags', 'created_at'
        )
        read_only_fields = fields

    def get_tags(self, obj):
        if not obj.tags:
            return []
        return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]


class SessionDetailSerializer(serializers.ModelSerializer):
    """
    High-fidelity serializer optimized for full detailed session profiles.
    """
    creator = CreatorSerializer(read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = (
            'id', 'creator', 'title', 'description', 'thumbnail_url', 
            'meeting_link', 'price', 'duration_minutes', 'max_participants', 
            'is_published', 'tags', 'created_at', 'updated_at'
        )
        read_only_fields = fields

    def get_tags(self, obj):
        if not obj.tags:
            return []
        return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]


class SessionCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer optimized for creating and updating sessions with strict validations.
    """
    class Meta:
        model = Session
        fields = (
            'id', 'title', 'description', 'thumbnail_url', 
            'meeting_link', 'price', 'duration_minutes', 
            'max_participants', 'is_published', 'tags'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be a negative amount.")
        return value

    def validate_duration_minutes(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be a positive integer greater than zero.")
        return value

    def validate_max_participants(self, value):
        if value <= 0:
            raise serializers.ValidationError("Maximum participants must be a positive integer greater than zero.")
        return value
