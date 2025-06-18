# GrowStack

A modern, scalable platform for managing user onboarding, referrals, and analytics.

## Features

- **User Management**
  - Secure authentication with JWT
  - Role-based access control
  - Profile management
  - KYC verification

- **Referral System**
  - Unique referral codes
  - Referral tracking
  - Reward management
  - Fraud detection

- **Onboarding Flow**
  - Multi-step onboarding process
  - Progress tracking
  - Automated notifications
  - Drop-off analytics

- **Notifications**
  - Multi-channel notifications (email, SMS)
  - Scheduled notifications
  - Notification preferences
  - Read/unread status

- **Analytics**
  - User behavior tracking
  - Conversion analytics
  - Referral performance
  - Custom event tracking

## Tech Stack

- **Backend**
  - Node.js with TypeScript
  - Express.js framework
  - PostgreSQL database
  - Redis for caching
  - JWT for authentication

- **Development Tools**
  - ESLint for code linting
  - Jest for testing
  - Docker for containerization
  - GitHub Actions for CI/CD

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 7 or higher
- Docker and Docker Compose (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/growstack.git
   cd growstack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env` with your configuration.

5. Run database migrations:
   ```bash
   npm run migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Setup

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. Run migrations in the container:
   ```bash
   docker-compose exec app npm run migrate
   ```

## Development

- Start development server:
  ```bash
  npm run dev
  ```

- Run tests:
  ```bash
  npm test
  ```

- Run linter:
  ```bash
  npm run lint
  ```

- Build for production:
  ```bash
  npm run build
  ```

## API Documentation

Detailed API documentation is available in [API.md](API.md).

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── tasks/          # Scheduled tasks
├── tests/          # Test files
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Testing

The project uses Jest for testing. Tests are located in the `src/tests` directory.

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
