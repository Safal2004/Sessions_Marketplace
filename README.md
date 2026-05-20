# Sessions Marketplace

A full-stack sessions marketplace where creators can host technical mentoring sessions and attendees can discover, book, and manage sessions through a modern dashboard interface.


**Live Demo:** [sessions.safaldev.com](https://sessions.safaldev.me)

---

## Platform Walkthrough & Screenshots

Below are placeholders where you can view or insert platform screenshots showing the sleek user experience:

* **Catalog Homepage**  
  *Place image here: `/screenshots/homepage.png`*  
 Homepage showing searchable sessions, creator cards, and booking actions.

* **Session Details & Payment Flow**  
  *Place image here: `/screenshots/session_detail.png`*  
  Session details page with pricing, capacity info, and Razorpay checkout flow.

* **Attendee Reservation Dashboard**  
  *Place image here: `/screenshots/attendee_dashboard.png`*  
  Dashboard for managing bookings, viewing statuses, and joining sessions.

* **Creator Management Dashboard**  
  *Place image here: `/screenshots/creator_dashboard.png`*  
  Creator dashboard for managing sessions, viewing attendees, and checking earnings.

---

## Features

### Authentication
- GitHub OAuth login
- JWT authentication using SimpleJWT
- Persistent login using Zustand
- Role-based access (`attendee` and `creator`)

### Sessions Marketplace
- Public sessions catalog
- Search and filtering
- Session detail pages
- Creator-only CRUD operations
- Responsive session cards and layouts

### Bookings
- Book paid or free sessions
- Capacity validation
- Prevent duplicate bookings
- Booking cancellation support
- Booking history dashboard

### Payments
- Razorpay test-mode integration
- Backend payment verification
- Automatic booking confirmation after payment
- Free sessions bypass checkout automatically

### Dashboards
- Separate attendee and creator dashboards
- Revenue and booking statistics
- Session management tables
- Bookings received section for creators

### Infrastructure
- Dockerized full-stack setup
- PostgreSQL database
- Nginx reverse proxy
- HTTPS with Let's Encrypt
- One-command startup using Docker Compose


---


## Architecture Overview

```txt
Browser
   │
   ▼
Nginx Reverse Proxy
   ├── Frontend (Next.js)
   └── Backend API (Django + DRF)
              │
              ▼
        PostgreSQL
---



##  Local Development Setup

Follow these steps to run the complete environment locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Safal2004/Sessions_Marketplace.git
cd Sessions_Marketplace
```

### 2. Configure Environment Files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start the Application
Run Docker Compose. This automatically pulls images, sets up the network, applies all database migrations, and **seeds 65 realistic sessions across 25 tech categories**:
```bash
docker compose up --build
```
Once healthy, navigate to `http://localhost` in your browser.

---

##  Environment Reference

### Backend Config (`backend/.env`)
* `SECRET_KEY`: Django secret key for secure signing.
* `DEBUG`: Set to `True` for development, `False` for production.
* `SOCIAL_AUTH_GITHUB_KEY`: Your GitHub OAuth App Client ID.
* `SOCIAL_AUTH_GITHUB_SECRET`: Your GitHub OAuth App Client Secret.
* `RAZORPAY_KEY_ID`: Razorpay API test Key ID.
* `RAZORPAY_KEY_SECRET`: Razorpay API test Key Secret.
* `FRONTEND_URL`: URL of the frontend (e.g., `http://localhost` or `https://sessions.safaldev.com`).
* `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Postgres connection credentials.

### Frontend Config (`frontend/.env`)
* `NEXT_PUBLIC_API_URL`: Root endpoint of your backend proxy. In Docker, this can be left blank as relative API routing is handled automatically.

---

##  GitHub OAuth Setup Guide

1.Open GitHub Developer Settings:
https://github.com/settings/developers 

2.Create a new OAuth App.
3. use the following values
   * **Application Name**: Sessions Marketplace
   * **Homepage URL**: `http://localhost` (or your domain)
   * **Authorization callback URL**: `http://localhost/auth/complete/github/`
4. Click **Register Application**, generate a **Client Secret**, and paste both values into your `backend/.env` file.



---

##  Production Deployment

The live instance at `https://sessions.safaldev.com` is deployed using:
* **Docker Compose**: Running in Gunicorn/NextJS production-optimized builds.
* **AWS EC2**: Hosted on a secure t3-micro instance.
* **Nginx HTTPS**: Configured with Let's Encrypt certbot SSL certificates for robust TLS encryption.

---

##  API Endpoints

| HTTP Method | Route Endpoint | Purpose | Access Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/auth/login/github/` | Initiates GitHub OAuth authentication | Open |
| **GET** | `/auth/me/` | Retrieves authenticated user profile details | Token |
| **POST** | `/auth/token/refresh/` | Requests new JWT Access token using Refresh token | Open |
| **GET** | `/api/v1/sessions/` | Fetch session catalog listing (supports `?search=`) | Open |
| **POST** | `/api/v1/sessions/` | Create a new session cohort | Creator |
| **GET** | `/api/v1/bookings/` | Fetch reservations log (hosts see sales, attendees see orders) | Token |
| **POST** | `/api/v1/payments/create-order/` | Initialize Razorpay payment transaction order | Token |
| **POST** | `/api/v1/payments/verify/` | Cryptographically verify Razorpay transaction signature | Token |

---

##  Project Structure

```
Sessions_Marketplace/
├── backend/
│   ├── bookings/        # Reservation and schedule logic
│   ├── config/          # Django core settings and URL routes
│   ├── payments/        # Razorpay checkout and verification API
│   ├── sessions_app/    # Sessions catalog model & views
│   └── users/           # Custom User profiles and OAuth pipeline
├── frontend/
│   ├── public/          # Static layout assets and icons
│   └── src/
│       ├── app/         # Next.js App Router workspace
│       ├── components/  # Sleek UI widgets (cards, modals, panels)
│       └── store/       # Zustand persistent authentication store
├── nginx/
│   └── nginx.conf       # Reverse proxy configuration
└── docker-compose.yml   # Multi-service build coordinator
```

---

##  Docker Commands

* **Restart Proxy Configuration**:
  ```bash
  docker compose restart nginx
  ```
* **Wipe Volumes and Start Fresh**:
  ```bash
  docker compose down -v
  docker compose up --build
  ```
* **Manually Seed/Re-seed Demo Data**:
  ```bash
  docker compose exec backend python seed_marketplace.py --reset
  ```

---

##  Future Improvements

* **Live Calendars**: Integrated Google Calendar scheduling for seamless booking-to-invite workflows.
* **In-app Chat**: Direct instant messaging capabilities between creators and attendees.
* **CI/CD pipeline**: using GitHub Actions
* **Email notifications**:  for booking confirmation, cancellation, and reminders.

