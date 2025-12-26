# 🎉 Events Platform

A full-stack Events Platform supporting **Seekers** (event attendees) and **Facilitators** (event creators), built with Django REST Framework + React.

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)
![Django](https://img.shields.io/badge/Django-4.2-green?logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwindcss)

---

## ✨ Features

### 🔐 Authentication
- Custom Email/Password signup with **OTP verification** (6-digit, 5-min expiry)
- Real email delivery via **Gmail SMTP**
- JWT-based authentication with access/refresh tokens
- Role-based access control (**Facilitator** vs **Seeker**)

### 📅 Events Management
- **Facilitators** can create, edit, and delete events
- **Seekers** can browse, search, and enroll in events
- Advanced filtering (location, language, date range, search query)
- Capacity management with enrollment limits

### 🎨 Modern UI
- Beautiful, responsive design with **Tailwind CSS**
- Multi-step form wizard for event creation
- Password strength indicator on signup
- Individual OTP input boxes with auto-focus
- Loading skeletons and smooth animations
- Stats dashboard for facilitators

### ⚙️ Background Tasks
- Welcome email on successful verification
- Enrollment confirmation emails
- Event reminder notifications (Celery + Redis)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django 4.2, Django REST Framework, SimpleJWT |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Task Queue** | Celery + Redis |
| **Email** | Gmail SMTP with App Password |

---

## �� Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Redis (for background tasks)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sachinandan-05/Ahoum_assignment.git
   cd Ahoum_assignment
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your-secret-key
   DEBUG=True
   
   # Email Configuration (Gmail SMTP)
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```
   
   > **Note**: For Gmail, you need to enable 2-Step Verification and create an [App Password](https://myaccount.google.com/apppasswords)

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Start the server**
   ```bash
   python manage.py runserver
   ```
   Backend runs at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`

### Docker Setup (Alternative)

```bash
docker-compose up --build
```

This starts Django API, PostgreSQL, Redis, and Celery workers.

---

## 📖 API Documentation

Interactive Swagger documentation available at:
- **Swagger UI**: http://localhost:8000/api/docs/

### Key Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup/` | Register with email, password, role |
| POST | `/auth/verify-email/` | Verify OTP code |
| POST | `/auth/resend-otp/` | Resend OTP to email |
| POST | `/auth/login/` | Get JWT tokens |
| POST | `/auth/token/refresh/` | Refresh access token |

#### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/events/` | List/search events |
| POST | `/events/events/` | Create event (Facilitator) |
| GET | `/events/events/{id}/` | Get event details |
| PUT | `/events/events/{id}/` | Update event (Owner) |
| DELETE | `/events/events/{id}/` | Delete event (Owner) |
| POST | `/events/events/{id}/enroll/` | Enroll in event (Seeker) |
| GET | `/events/events/my_events/` | List owned events |

#### Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/enrollments/` | List my enrollments |
| GET | `/events/enrollments/upcoming/` | Upcoming enrollments |
| GET | `/events/enrollments/past/` | Past enrollments |

### Query Parameters for Events
- `q` - Search in title/description
- `location` - Filter by location
- `language` - Filter by language
- `starts_after` - Events starting after date
- `starts_before` - Events starting before date

---

## 📁 Project Structure

```
Ahoum_assignment/
├── events_platform/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── celery.py
├── users/                    # Authentication app
│   ├── models.py            # User Profile with OTP
│   ├── serializers.py       # Auth serializers
│   ├── views.py             # Auth views
│   └── utils.py             # Email utilities
├── events/                   # Events app
│   ├── models.py            # Event, Enrollment models
│   ├── views.py             # Event ViewSets
│   ├── serializers.py       # Event serializers
│   ├── filters.py           # Search filters
│   ├── permissions.py       # RBAC permissions
│   └── tasks.py             # Celery tasks
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # Reusable components
│   │   └── pages/           # Page components
│   │       ├── Auth/        # Login, Signup, Verify
│   │       ├── Facilitator/ # MyEvents, CreateEvent
│   │       └── Seeker/      # EventsList, MyEnrollments
│   └── package.json
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## 🎨 Screenshots

### Authentication Flow
- **Login** - Split-screen design with gradient branding
- **Signup** - Password strength indicator, role selection cards
- **OTP Verification** - Individual digit boxes with countdown timer

### Facilitator Dashboard
- **My Events** - Stats cards, event management with enrollment progress
- **Create Event** - Multi-step form wizard with live preview

### Seeker Pages
- **Events List** - Browse and search available events
- **My Enrollments** - Track enrolled events

---

## 🧪 Testing

Run backend tests:
```bash
pytest
```

Run specific test files:
```bash
pytest users/test_auth.py -v
pytest events/test_events.py -v
```

---

## 📝 Design Decisions

1. **User Model**: Used a `Profile` model with OneToOne relationship to Django's User model (as per requirements) to store `role` and `otp`.

2. **OTP System**: 6-digit OTP with 5-minute expiry, stored in Profile model, sent via Gmail SMTP.

3. **Enrollments**: Dedicated `Enrollment` model with `unique_together` constraint to prevent double-booking.

4. **Background Tasks**: Celery + Redis for welcome emails, enrollment confirmations, and event reminders.

5. **Frontend Architecture**: React with TypeScript for type safety, react-hook-form for form handling, and Tailwind CSS for styling.

---

## 👤 Author

**Sachinandan**
- GitHub: [@sachinandan-05](https://github.com/sachinandan-05)

---

## 📄 License

This project is created as an assignment submission.
