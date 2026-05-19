import uuid
from django.db import models
from django.conf import settings
from sessions_app.models import Session

class Booking(models.Model):
    """
    Booking model representing a scheduled reservation for a Session by an attendee.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        db_index=True,
        help_text="The authenticated user who booked this session."
    )
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='bookings',
        db_index=True,
        help_text="The session that is booked."
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='confirmed',
        db_index=True,
        help_text="Current state of the booking."
    )
    booked_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-booked_at']
        unique_together = ('user', 'session')

    def __str__(self):
        return f"{self.user.username} booked {self.session.title} ({self.status})"
