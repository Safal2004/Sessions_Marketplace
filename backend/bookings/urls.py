from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet

# Configure DRF router
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
]
