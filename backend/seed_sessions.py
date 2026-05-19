import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from sessions_app.models import Session

User = get_user_model()

def seed():
    print("Seeding sample sessions into local database...")
    
    # 1. Fetch or create a creator
    creator = User.objects.filter(role='creator').first()
    if not creator:
        creator = User.objects.filter(is_superuser=True).first()
    
    if not creator:
        # Fallback creation
        creator = User.objects.create_user(
            username='jane_dev',
            email='jane@example.com',
            password='password123',
            role='creator'
        )
        print(f"Created fallback creator user: {creator.username}")
    else:
        # Make sure role is set to creator for catalog visibility
        if creator.role != 'creator':
            creator.role = 'creator'
            creator.save()
            print(f"Updated user {creator.username} role to 'creator'")

    # 2. Mock sessions array
    sessions_data = [
        {
            "title": "System Design & Scale Consult",
            "description": "Custom session reviewing cache layout systems, load balancer patterns, database replica scaling, and message queue backpressure strategies.",
            "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "price": 75.00,
            "duration_minutes": 60,
            "max_participants": 2,
            "is_published": True,
            "tags": "system-design, architecture, cloud"
        },
        {
            "title": "Next.js App Router Deep-Dive",
            "description": "Let's explore Next.js Server Actions, Suspense boundaries, layout composition structures, streaming, and optimization patterns for Next.js App Router.",
            "thumbnail_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
            "meeting_link": "https://meet.google.com/qwe-rtyu-iop",
            "price": 45.00,
            "duration_minutes": 45,
            "max_participants": 5,
            "is_published": True,
            "tags": "nextjs, react, frontend"
        },
        {
            "title": "Django REST Framework Review",
            "description": "Complete breakdown of custom serializers validation, custom permissions routing, select_related query optimization, and dynamic filters in viewsets.",
            "thumbnail_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
            "meeting_link": "https://meet.google.com/zxc-vbnm-asd",
            "price": 0.00,
            "duration_minutes": 30,
            "max_participants": 10,
            "is_published": True,
            "tags": "django, python, backend"
        }
    ]

    for item in sessions_data:
        session, created = Session.objects.get_or_create(
            title=item["title"],
            defaults={
                "creator": creator,
                "description": item["description"],
                "thumbnail_url": item["thumbnail_url"],
                "meeting_link": item["meeting_link"],
                "price": item["price"],
                "duration_minutes": item["duration_minutes"],
                "max_participants": item["max_participants"],
                "is_published": item["is_published"],
                "tags": item["tags"]
            }
        )
        if created:
            print(f"Created session: {session.title}")
        else:
            print(f"Session already exists: {session.title}")

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
