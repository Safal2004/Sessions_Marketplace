import uuid
from django.db import models
from django.conf import settings

class Session(models.Model):
    """
    Session model representing a 1-on-1 or group session offered by a creator.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions',
        db_index=True,
        help_text="The creator offering this session."
    )
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    thumbnail_url = models.URLField(
        blank=True, 
        null=True, 
        help_text="Optional URL to a thumbnail image for the session."
    )
    meeting_link = models.URLField(
        blank=True, 
        null=True, 
        help_text="Optional online meeting link (e.g. Zoom, Google Meet)."
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Cost of the session in USD (or local currency)."
    )
    duration_minutes = models.PositiveIntegerField(
        help_text="Duration of the session in minutes."
    )
    max_participants = models.PositiveIntegerField(
        default=1,
        help_text="Maximum number of attendees allowed in this session."
    )
    is_published = models.BooleanField(
        default=False, 
        db_index=True,
        help_text="Whether this session is publicly visible."
    )
    tags = models.CharField(
        max_length=255, 
        blank=True, 
        help_text="Comma-separated tags for this session."
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.creator.username}"
