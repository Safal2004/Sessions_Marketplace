from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingDetailSerializer
)

class BookingResultsSetPagination(PageNumberPagination):
    """
    Pagination class for booking results.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class BookingViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for managing user reservations with owner-isolation, 
    strict validation controls, and advanced dashboard stats.
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = BookingResultsSetPagination

    def get_queryset(self):
        # Authenticated users must ONLY see their own bookings
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related('session', 'session__creator')
            .order_by('-booked_at')
        )

    def get_serializer_class(self):
        """
        Dynamically toggle serialization models based on query actions.
        """
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action == 'retrieve':
            return BookingDetailSerializer
        return BookingListSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Support cancellations via standard DELETE calls to prevent database purging.
        """
        booking = self.get_object()
        booking.status = 'cancelled'
        booking.save()
        return Response({'status': 'confirmed booking cancelled successfully'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='summary')
    def dashboard_summary(self, request, *args, **kwargs):
        """
        Custom endpoint yielding total reservation counts and breakdowns.
        """
        bookings = self.get_queryset()
        
        total = bookings.count()
        confirmed = bookings.filter(status='confirmed').count()
        pending = bookings.filter(status='pending').count()
        cancelled = bookings.filter(status='cancelled').count()

        return Response({
            'total_bookings': total,
            'confirmed_bookings': confirmed,
            'pending_bookings': pending,
            'cancelled_bookings': cancelled
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='received')
    def received_bookings(self, request, *args, **kwargs):
        """
        Endpoint for creators to view bookings received for their hosted sessions.
        """
        if request.user.role != 'creator':
            return Response({'detail': 'Only creators can access received bookings.'}, status=status.HTTP_403_FORBIDDEN)
        
        received = Booking.objects.filter(session__creator=request.user).select_related('session', 'user').order_by('-booked_at')
        
        page = self.paginate_queryset(received)
        from .serializers import BookingReceivedSerializer
        if page is not None:
            serializer = BookingReceivedSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = BookingReceivedSerializer(received, many=True)
        return Response(serializer.data)
