from rest_framework import serializers
from django.contrib.auth import get_user_model
from sessions_app.models import Session
from sessions_app.serializers import SessionListSerializer
from .models import Booking

User = get_user_model()

class BookingCreateSerializer(serializers.ModelSerializer):
    """
    Serializer optimized for creating new bookings with comprehensive business rules validation.
    """
    session_id = serializers.UUIDField(required=True)

    class Meta:
        model = Booking
        fields = ('session_id',)

    def validate_session_id(self, value):
        # 1. Validate session existence
        try:
            session = Session.objects.get(id=value)
        except Session.DoesNotExist:
            raise serializers.ValidationError("The selected session does not exist.")

        # 2. Validate session is published
        if not session.is_published:
            raise serializers.ValidationError("Cannot book an unpublished session.")

        request = self.context.get('request')
        if request and request.user:
            user = request.user
            
            # 3. Prevent creators from booking their own sessions
            if session.creator == user:
                raise serializers.ValidationError("Creators cannot book their own sessions.")

            # 4. Prevent duplicate bookings
            if Booking.objects.filter(user=user, session=session).exists():
                raise serializers.ValidationError("You have already booked this session.")

            # 5. Prevent booking full sessions
            if session.is_full:
                raise serializers.ValidationError("This session is already full. No remaining seats.")

        return value

    def create(self, validated_data):
        session = Session.objects.get(id=validated_data['session_id'])
        user = self.context['request'].user
        return Booking.objects.create(user=user, session=session, status='confirmed')


class BookingListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer representing high-quality listing payloads.
    """
    session = SessionListSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'session', 'status', 'booked_at')
        read_only_fields = fields


class BookingDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer representing full detailed session bookings.
    """
    session = SessionListSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'session', 'status', 'booked_at')
        read_only_fields = fields


class UserNestedSerializer(serializers.ModelSerializer):
    """
    Lightweight nested serializer to expose booked user profile details.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar_url')
        read_only_fields = fields


class BookingReceivedSerializer(serializers.ModelSerializer):
    """
    Serializer exposing bookings received by creator hosts.
    """
    session = SessionListSerializer(read_only=True)
    user = UserNestedSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'session', 'user', 'status', 'booked_at')
        read_only_fields = fields
