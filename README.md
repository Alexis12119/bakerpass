# Appointment System

A comprehensive healthcare visitor management and appointment system built with a modern tech stack, featuring role-based access control and multi-platform support.

## 🏗️ Project Architecture

This project consists of three main components:

- **Backend**: Node.js API server with WebSocket support
- **Frontend**: Next.js web application with TypeScript and Tailwind CSS
- **Mobile**: Flutter application for visitors

## 🚀 Features

### Role-Based Access Control

- **Security Personnel**: Visitor check-in/check-out, host verification
- **Nurses**: Health declarations, high-care approvals, medical assessments
- **HR Staff**: Employee management, reporting, dashboard analytics
- **Employees**: Visitor management, appointment scheduling
- **Visitors**: Mobile app for self-service appointments and check-ins

### Core Functionality

- Visitor approval workflows (Security & Nurse roles)
- Walk-in visitor registration
- Appointment scheduling and management
- Employee administration (HR)
- Visitor commenting system
- Real-time visitor tracking with WebSocket connections
- Multi-role dashboard interfaces
- Authentication and authorization system

## 📁 Project Structure

```
appointment-system/
├── backend/           # Node.js API server
├── frontend/          # Next.js web application
├── mobile/           # Flutter mobile app
├── ngrok/            # Tunneling configuration
└── docker-compose.yml # Container orchestration
```

## 🛠️ Tech Stack

### Backend

- **Node.js** with Fastify
- **WebSocket** for real-time communication
- **MySQL** database
- **Docker** containerization

### Frontend

- **Next.js** with TypeScript
- **Tailwind CSS** for styling
- **React** components with modern hooks
- **Responsive** design for all devices

### Infrastructure

- **Nginx** reverse proxy
- **ngrok** for secure tunneling
- **Docker Compose** for orchestration
- **MySQL** for data persistence

### Mobile

- **Flutter** for cross-platform mobile development
- **Dart** programming language
- **Provider** state management
- **HTTP** API integration

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Docker and Docker Compose
- Flutter SDK (for mobile development)
- ngrok account (for secure tunneling)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd appointment-system
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm start
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Mobile Setup**

   ```bash
   cd mobile/visitors
   flutter pub get
   flutter run
   ```

5. **Database Setup**

   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE appointment_system;

   # Run migrations (if available)
   cd backend
   npm run migrate
   ```

6. **ngrok Setup (for external access)**

   ```bash
   cd ngrok
   # Install ngrok and authenticate
   ngrok authtoken your_auth_token
   ngrok http 3000
   ```

7. **Docker Setup (Alternative)**
   ```bash
   docker-compose up -d
   ```

## 🔧 Configuration

### Environment Variables

Create `.env` files in both backend and frontend directories with the following variables:

#### Backend (.env)

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
EMAIL_USER=
EMAIL_PASS=
JWT_KEY=
SALT_ROUNDS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_HOST=
NEXT_PUBLIC_BACKEND_WS=
```

#### Mobile (.env)

```env
BASE_URL=
```

## 🏥 User Roles & Permissions

### Security Personnel

- Visitor approval and management
- Walk-in visitor registration
- Real-time visitor tracking
- Access control and monitoring

### Nurses

- Clinic visitor approvals
- Medical screening processes
- Health-related visitor management
- Clinical workflow coordination

### HR Staff

- Visitor monitoring and oversight
- Employee management and administration

### Employees

- Visitor management
- Appointment scheduling
- Host responsibilities
- Visitor tracking

## 📱 Mobile Features

The Flutter mobile app provides visitors with:

- Appointment booking and scheduling
- Visit history tracking
- Comment and feedback system
- Real-time notifications
- Self-service registration

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting for API endpoints
- Protected routes and API endpoints
- Input validation and sanitization
- HTTPS enforcement
- Session management

## 🐳 Docker Deployment

The project includes Docker configuration for easy deployment:

```bash
docker-compose up -d
```

This will start:

- Fastify backend API server
- Next.js frontend application
- MySQL database instance
- Nginx reverse proxy
- ngrok tunnel (if configured)

## 📊 API Documentation

The Fastify backend provides RESTful APIs with the following endpoints:

- `/auth` - Authentication and authorization
- `/employees` - Employee management
- `/visitors` - Visitor operations
- `/hr` - HR functionalities
- `/nurse` - Medical processes

**Fastify Features:**

- High-performance HTTP server
- Built-in JSON schema validation
- Rate limiting middleware
- Automatic OpenAPI documentation
- Plugin architecture
- TypeScript support

WebSocket endpoints handle real-time features like visitor status updates and notifications.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Mobile tests
cd mobile/visitors
flutter test
```

## 📈 Monitoring & Analytics

The system includes comprehensive monitoring through:

- Real-time dashboards
- Visit analytics
- Performance metrics
- Error tracking
- Usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in each module

## 🚧 Development Status

This project is actively under development. Current focus areas:

- Enhanced mobile features
- Advanced reporting capabilities
- Performance optimizations
- Additional integrations

---

Built with ❤️ for efficient appointment management system.
