import os
import sys
import django
import random
from datetime import datetime, timezone, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from sessions_app.models import Session
from bookings.models import Booking

User = get_user_model()

# ==========================================
# 1. 15 HIGHLY REALISTIC CREATOR PERSONAS
# ==========================================

CREATORS_DATA = [
    {
        "username": "alex_devops",
        "first_name": "Alex",
        "last_name": "Mercer",
        "email": "alex.devops@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "mei_ling",
        "first_name": "Mei",
        "last_name": "Ling",
        "email": "mei.ling@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "adrian_design",
        "first_name": "Adrian",
        "last_name": "Dubois",
        "email": "adrian.design@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "priya_ds",
        "first_name": "Priya",
        "last_name": "Sharma",
        "email": "priya.ds@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "yuki_taka",
        "first_name": "Yuki",
        "last_name": "Takahashi",
        "email": "yuki.taka@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "carlos_back",
        "first_name": "Carlos",
        "last_name": "Gomez",
        "email": "carlos.back@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "fatima_sec",
        "first_name": "Fatima",
        "last_name": "Al-Sayed",
        "email": "fatima.sec@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "elena_coach",
        "first_name": "Elena",
        "last_name": "Petrova",
        "email": "elena.coach@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "kwame_mob",
        "first_name": "Kwame",
        "last_name": "Mensah",
        "email": "kwame.mob@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "sarah_pm",
        "first_name": "Sarah",
        "last_name": "Jenkins",
        "email": "sarah.pm@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "diego_data",
        "first_name": "Diego",
        "last_name": "Rossi",
        "email": "diego.data@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "olga_rust",
        "first_name": "Olga",
        "last_name": "Ivanova",
        "email": "olga.rust@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "zainab_next",
        "first_name": "Zainab",
        "last_name": "Bello",
        "email": "zainab.next@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "liam_web3",
        "first_name": "Liam",
        "last_name": "O'Connor",
        "email": "liam.web3@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    },
    {
        "username": "hassan_pen",
        "first_name": "Hassan",
        "last_name": "Raza",
        "email": "hassan.pen@sessions.com",
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80",
        "role": "creator"
    }
]

ATTENDEES_DATA = [
    {"username": "john_doe", "first_name": "John", "last_name": "Doe", "email": "john@example.com", "role": "user"},
    {"username": "linda_smith", "first_name": "Linda", "last_name": "Smith", "email": "linda@example.com", "role": "user"},
    {"username": "sam_wilson", "first_name": "Sam", "last_name": "Wilson", "email": "sam@example.com", "role": "user"},
    {"username": "emma_watson", "first_name": "Emma", "last_name": "Watson", "email": "emma@example.com", "role": "user"}
]

# Highly standard, ultra-reliable Unsplash technology image URLs guaranteed to load
SESSION_THUMBNAILS = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60", # code screen
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60", # laptop code
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60", # matrix code
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60", # design whiteboard
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60", # neon servers
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=60", # code colorful
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=60", # dashboard graphics
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60", # laptop desk
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60", # analytical charts
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60"  # secure lock
]

# =========================================================================
# 2. 25 DISTINCT TECH CATEGORIES (CATALOGS) WITH 2-3 REALISTIC COHORTS EACH
# =========================================================================

SESSIONS_TEMPLATES = [
    # 1. DevOps
    {
        "title": "Production Kubernetes Clusters at scale",
        "description": "Learn to manage multi-region cluster scaling, configure high-performance ingress controllers, set up autoscaling bounds, and configure proper resource metrics.",
        "category": "DevOps",
        "tags": ["kubernetes", "devops", "cloud", "docker"],
        "price": 89.00,
        "duration": 60,
        "max_cap": 5
    },
    # 2. Cloud Architecture
    {
        "title": "Terraform Infrastructure Refactoring",
        "description": "Examine state files management architectures, multi-environment workspace configs, custom modules design, and safe provider updating guidelines.",
        "category": "Cloud Architecture",
        "tags": ["terraform", "devops", "aws", "iac"],
        "price": 60.00,
        "duration": 45,
        "max_cap": 3
    },
    # 3. Cloud Savings (FinOps)
    {
        "title": "Cloud cost optimization strategies",
        "description": "Wasting budgets on oversized EC2 or idle RDS databases? Learn how to implement tagging, spot instances, auto-sleeping scripts, and AWS budget tracking.",
        "category": "Cloud Savings (FinOps)",
        "tags": ["aws", "cloud", "finops", "devops"],
        "price": 0.00,
        "duration": 30,
        "max_cap": 15
    },
    # 4. AI Engineering
    {
        "title": "Fine-Tuning LLMs on Custom Data",
        "description": "Deep dive into PEFT, LoRA adapters, dataset tokenization strategies, custom loss functions configuration, and deploying models using vLLM inference engines.",
        "category": "AI Engineering",
        "tags": ["ai", "machine-learning", "pytorch", "transformers"],
        "price": 120.00,
        "duration": 90,
        "max_cap": 4
    },
    # 5. Machine Learning (MLOps)
    {
        "title": "Build a RAG system with PGVector",
        "description": "Implement vector embeddings, ingest document data with LangChain, perform similarity search via PostgreSQL pgvector indexing, and wire context to OpenAI.",
        "category": "Machine Learning (MLOps)",
        "tags": ["ai", "vector-db", "postgres", "llm"],
        "price": 50.00,
        "duration": 45,
        "max_cap": 8
    },
    # 6. UI/UX Design
    {
        "title": "Figma design systems setup",
        "description": "A comprehensive session mapping design variables, local styles, nesting component properties, interactive states, and design token exports.",
        "category": "UI/UX Design",
        "tags": ["figma", "uiux", "design-system", "product-design"],
        "price": 45.00,
        "duration": 60,
        "max_cap": 5
    },
    # 7. Product Design
    {
        "title": "UX auditing & conversion optimization",
        "description": "Let's review user drop-off points, analyze accessibility metrics (WCAG), optimize landing page whitespace hierarchy, and map professional user checkout funnels.",
        "category": "Product Design",
        "tags": ["ux-audit", "ux", "landing-page", "marketing"],
        "price": 75.00,
        "duration": 45,
        "max_cap": 2
    },
    # 8. Data Structures & Algorithms
    {
        "title": "Cracking dynamic programming problems",
        "description": "Master memoization and tabulations. We will break down knapsack variations, sequence alignment codes, grid travelers, and interval DP problems step-by-step.",
        "category": "Data Structures & Algorithms",
        "tags": ["dsa", "algorithms", "interview-prep", "leetcode"],
        "price": 65.00,
        "duration": 60,
        "max_cap": 6
    },
    # 9. Graph Algorithms
    {
        "title": "Graphs Traversals & pathfinding algorithms",
        "description": "Implement standard BFS/DFS algorithms, code Dijkstra for shortest paths, understand dynamic A* boundaries, and master topological sort logic.",
        "category": "Graph Algorithms",
        "tags": ["dsa", "graphs", "algorithms", "faang"],
        "price": 0.00,
        "duration": 45,
        "max_cap": 20
    },
    # 10. Web Development
    {
        "title": "Next.js Server Actions & Suspense",
        "description": "Master advanced streaming concepts. We will build zero-JS state mutations, capture optimistic hook states, configure skeleton views, and clear path caches.",
        "category": "Web Development",
        "tags": ["nextjs", "react", "frontend", "web-dev"],
        "price": 55.00,
        "duration": 60,
        "max_cap": 4
    },
    # 11. Frontend Optimization
    {
        "title": "React Performance Optimizations",
        "description": "Deep review of fibers rendering mechanics. Correctly configure memo, useMemo, and useCallback hooks to prevent re-render leaks in large applications.",
        "category": "Frontend Optimization",
        "tags": ["react", "frontend", "performance", "javascript"],
        "price": 40.00,
        "duration": 30,
        "max_cap": 5
    },
    # 12. Backend Engineering
    {
        "title": "PostgreSQL query tuning & indexing",
        "description": "Learn to read EXPLAIN ANALYZE statements, setup composite B-Tree indexes, manage query plans caching, and isolate transaction isolation blocks.",
        "category": "Backend Engineering",
        "tags": ["postgres", "database", "backend", "django"],
        "price": 80.00,
        "duration": 60,
        "max_cap": 4
    },
    # 13. API Architecture
    {
        "title": "Building concurrent APIs with Django channels",
        "description": "Implement WebSockets support in Django, configure clean ASGI routing, map Redis channel layer setups, and build dynamic notification feeds.",
        "category": "API Architecture",
        "tags": ["django", "python", "websockets", "redis"],
        "price": 95.00,
        "duration": 90,
        "max_cap": 3
    },
    # 14. Career Coaching
    {
        "title": "Resume refactoring & FAANG screening",
        "description": "A deep review of your current CV. I will rewrite descriptions to highlight key achievements, setup strong resume headings, and ensure parsing for ATS scanners.",
        "category": "Career Coaching",
        "tags": ["resume-review", "career-advice", "interview-prep"],
        "price": 110.00,
        "duration": 45,
        "max_cap": 2
    },
    # 15. Product Management
    {
        "title": "Mock Product Manager Case Interview",
        "description": "Practice product sense, scaling questions, execution frameworks, and structural metrics queries. Get detailed personal feedback logs immediately.",
        "category": "Product Management",
        "tags": ["product-management", "pm-interview", "mock-interview"],
        "price": 130.00,
        "duration": 60,
        "max_cap": 1
    },
    # 16. Blockchain & Smart Contracts
    {
        "title": "Solidity Smart Contract Security Audit",
        "description": "Examine reentrancy leaks, integer overflow bounds, frontrunning risks, and gas-efficient storage patterns in modern Solidity smart contracts.",
        "category": "Blockchain & Smart Contracts",
        "tags": ["solidity", "ethereum", "web3", "security"],
        "price": 149.00,
        "duration": 60,
        "max_cap": 2
    },
    # 17. Cybersecurity
    {
        "title": "OWASP Top 10 Security Mitigation",
        "description": "Review SQL injection preventions, cross-site scripting (XSS) filters, secure CSRF tokens, and identity management boundaries in production apps.",
        "category": "Cybersecurity",
        "tags": ["cybersecurity", "security", "pentest", "owasp"],
        "price": 90.00,
        "duration": 60,
        "max_cap": 4
    },
    # 18. Mobile Development
    {
        "title": "Flutter Cross-Platform Architecture",
        "description": "Implement clean state management using BLoC or Riverpod, write unit tests for repositories, and compile lightweight Android & iOS bundles.",
        "category": "Mobile Development",
        "tags": ["flutter", "mobile", "android", "ios"],
        "price": 70.00,
        "duration": 60,
        "max_cap": 6
    },
    # 19. Systems Programming
    {
        "title": "Rust Embedded Systems & WASM compilation",
        "description": "Compiling Rust directly to WebAssembly for extreme UI speeds, managing physical memory bounds, and running clean benchmark sweeps.",
        "category": "Systems Programming",
        "tags": ["rust", "wasm", "systems", "performance"],
        "price": 105.00,
        "duration": 90,
        "max_cap": 3
    },
    # 20. Engineering Management
    {
        "title": "Agile Sprint Roadmaps & stakeholder alignment",
        "description": "Learn elite sprint planning tactics, manage project velocities, resolve cross-team blockers, and configure high-conversion Jira dashboards.",
        "category": "Engineering Management",
        "tags": ["management", "agile", "leadership", "scrum"],
        "price": 115.00,
        "duration": 45,
        "max_cap": 5
    },
    # 21. Database Administration
    {
        "title": "Redis caching & pub-sub systems",
        "description": "Set up highly performant distributed caching bounds, dynamic session storage, messaging queues, and handle Redis connection pools securely.",
        "category": "Database Administration",
        "tags": ["redis", "database", "backend", "caching"],
        "price": 50.00,
        "duration": 30,
        "max_cap": 10
    },
    # 22. DevSecOps
    {
        "title": "Automated security scanning in CI/CD",
        "description": "Integrate SonarQube, Snyk, and GitGuardian secrets scanners directly into GitHub Actions configurations to audit dependencies and secure tokens.",
        "category": "DevSecOps",
        "tags": ["devsecops", "ci-cd", "github-actions", "security"],
        "price": 0.00,
        "duration": 45,
        "max_cap": 12
    },
    # 23. Developer Relations
    {
        "title": "Building active developer communities",
        "description": "Learn how to structure developer advocate roadmaps, run high-converting developer hackathons, and design high-quality open-source tutorials.",
        "category": "Developer Relations",
        "tags": ["devrel", "community", "marketing", "open-source"],
        "price": 40.00,
        "duration": 30,
        "max_cap": 8
    },
    # 24. Game Development
    {
        "title": "Unity 3D Engine & physical shaders coding",
        "description": "Master C# bindings inside Unity, compile lightweight game physics parameters, compile custom shadows shaders, and configure mobile builds.",
        "category": "Game Development",
        "tags": ["unity", "gamedev", "csharp", "shaders"],
        "price": 85.00,
        "duration": 60,
        "max_cap": 4
    },
    # 25. QA Automation
    {
        "title": "Playwright end-to-end automated testing",
        "description": "Write fast, non-flaky integration test suites covering visual assertions, complex auth states saving, dynamic API mocks, and CI workflows.",
        "category": "QA Automation",
        "tags": ["playwright", "testing", "automation", "javascript"],
        "price": 45.00,
        "duration": 45,
        "max_cap": 6
    }
]

# ==========================================
# 3. SEEDING ENGINE
# ==========================================

def run_seeder(reset_all=False):
    print("--------------------------------------------------")
    print("Sessions Marketplace Data Seeder")
    print("--------------------------------------------------")

    if reset_all:
        print("Reset triggered: Wiping existing Bookings, Sessions, and Demo Users...")
        Booking.objects.all().delete()
        Session.objects.all().delete()
        demo_emails = [c['email'] for c in CREATORS_DATA] + [a['email'] for a in ATTENDEES_DATA]
        User.objects.filter(email__in=demo_emails).delete()
        print("Database wipe complete.")

    # 1. Create or fetch Creators
    creators = []
    for cd in CREATORS_DATA:
        creator, created = User.objects.get_or_create(
            username=cd['username'],
            defaults={
                'first_name': cd['first_name'],
                'last_name': cd['last_name'],
                'email': cd['email'],
                'avatar_url': cd['avatar_url'],
                'role': cd['role'],
                'has_completed_onboarding': True
            }
        )
        if created:
            creator.set_password('password123')
            creator.save()
            print(f"[NEW] Created Creator: {creator.username}")
        else:
            creator.role = 'creator'
            creator.save()
            print(f"[EXISTS] Creator: {creator.username}")
        creators.append(creator)

    # 2. Create or fetch Attendees
    attendees = []
    for ad in ATTENDEES_DATA:
        attendee, created = User.objects.get_or_create(
            username=ad['username'],
            defaults={
                'first_name': ad['first_name'],
                'last_name': ad['last_name'],
                'email': ad['email'],
                'role': ad['role'],
                'has_completed_onboarding': True
            }
        )
        if created:
            attendee.set_password('password123')
            attendee.save()
            print(f"[NEW] Created Attendee: {attendee.username}")
        else:
            print(f"[EXISTS] Attendee: {attendee.username}")
        attendees.append(attendee)

    # 3. Seed Sessions (Total target: 65 sessions across 25 catalogs to fill the marketplace with premium data)
    sessions = []
    session_count = 0
    
    print("\nSeeding 65 premium marketplace sessions across 25 distinct tech catalogs...")
    
    # To cover 25 categories, cycle through the 25 templates and assign each to one of the 15 creators!
    for idx, template in enumerate(SESSIONS_TEMPLATES):
        # 1. Primary Cohort (Cohort 1)
        cd = creators[idx % len(creators)]
        thumb = SESSION_THUMBNAILS[idx % len(SESSION_THUMBNAILS)]
        meet_link = f"https://meet.google.com/hms-{random.randint(100,999)}-{random.randint(100,999)}"

        session1, created1 = Session.objects.get_or_create(
            title=template['title'],
            defaults={
                'creator': cd,
                'description': template['description'],
                'thumbnail_url': thumb,
                'price': template['price'],
                'duration_minutes': template['duration'],
                'max_participants': template['max_cap'],
                'meeting_link': meet_link,
                'is_published': True,
                'tags': template['tags']
            }
        )
        if created1:
            session_count += 1
        sessions.append(session1)

        # 2. Secondary Cohort (Cohort 2) - Varied times and pricing to show realistic marketplace spread
        cd2 = creators[(idx + 3) % len(creators)]
        thumb2 = SESSION_THUMBNAILS[(idx + 4) % len(SESSION_THUMBNAILS)]
        meet_link2 = f"https://meet.google.com/hms-{random.randint(100,999)}-{random.randint(100,999)}"
        cohort2_title = f"{template['title']} (Cohort 2)"
        
        # Vary price slightly for cohort 2 (premium vs discounted)
        c2_price = template['price']
        if c2_price > 0:
            c2_price = round(c2_price * random.choice([0.85, 1.15, 1.00]), 2)

        session2, created2 = Session.objects.get_or_create(
            title=cohort2_title,
            defaults={
                'creator': cd2,
                'description': f"Join this second interactive cohort covering: {template['description']}",
                'thumbnail_url': thumb2,
                'price': c2_price,
                'duration_minutes': template['duration'],
                'max_participants': template['max_cap'],
                'meeting_link': meet_link2,
                'is_published': True,
                'tags': template['tags'] + ["cohort-2"]
            }
        )
        if created2:
            session_count += 1
        sessions.append(session2)

    # Add 15 extra completely randomized sessions to easily clear the 60+ session goal!
    for extra_idx in range(15):
        template = random.choice(SESSIONS_TEMPLATES)
        cd = random.choice(creators)
        thumb = random.choice(SESSION_THUMBNAILS)
        meet_link = f"https://meet.google.com/hms-{random.randint(100,999)}-{random.randint(100,999)}"
        extra_title = f"{template['title']} - Mastery Lab {extra_idx + 1}"

        session_extra, created_extra = Session.objects.get_or_create(
            title=extra_title,
            defaults={
                'creator': cd,
                'description': f"Advanced Masterclass Lab. {template['description']}",
                'thumbnail_url': thumb,
                'price': template['price'],
                'duration_minutes': template['duration'],
                'max_participants': max(2, template['max_cap'] - 1),
                'meeting_link': meet_link,
                'is_published': True,
                'tags': template['tags'] + ["mastery"]
            }
        )
        if created_extra:
            session_count += 1
        sessions.append(session_extra)

    print(f"Successfully populated {session_count} new unique sessions.")

    # 4. Seed Bookings to create a highly active and populated workspace dashboard
    print("\nSeeding client reservations & dashboard metrics...")
    booking_count = 0
    statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled']

    for attendee in attendees:
        # Give 6 bookings to each attendee user across the massive catalog list
        target_sessions = random.sample(sessions, 6)
        for ts in target_sessions:
            if ts.creator == attendee:
                continue

            status = random.choice(statuses)
            days_ago = random.randint(1, 14)
            booked_date = datetime.now(timezone.utc) - timedelta(days=days_ago)

            booking, created = Booking.objects.get_or_create(
                user=attendee,
                session=ts,
                defaults={
                    'status': status,
                    'booked_at': booked_date
                }
            )
            if created:
                booking_count += 1

    print(f"Successfully populated {booking_count} mock reservations.")
    print("--------------------------------------------------")
    print("Marketplace demo data seeding completed successfully!")
    print("--------------------------------------------------")

if __name__ == "__main__":
    reset = False
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        reset = True
    run_seeder(reset_all=reset)
