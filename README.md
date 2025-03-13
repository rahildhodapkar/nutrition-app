# Nutron - Nutrition Tracking Platform

![Nutron Banner](https://via.placeholder.com/800x200?text=Nutron:+Smart+Nutrition+Tracking)

## Live Demo

Experience Nutron in action: [Live Demo](https://nutrition-app-49a16.web.app/)

## Overview

Nutron is a comprehensive full-stack nutrition tracking platform that empowers users to take control of their dietary habits and fitness goals. Built with modern web technologies, it offers personalized tracking of daily caloric intake and macronutrient consumption (protein, fat, carbohydrates).

### Key Features

- **Personalized Nutrition Dashboard**: Track and visualize your daily caloric intake and macronutrient consumption
- **TDEE Calculator**: Calculate your Total Daily Energy Expenditure using the Mifflin-St Jeor equation
- **Weight Progress Tracker**: Monitor your weight changes over time with intuitive data visualization
- **Smart Macro Planning**: Generate personalized macronutrient targets based on your fitness goals
- **Recipe Finder**: Discover meal ideas that match your ingredient preferences and calorie requirements
- **Food Database Integration**: Search and log foods with detailed nutritional information via USDA database
- **Secure User Authentication**: User account management with secure password handling
- **Responsive Design**: Seamless experience across desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **Chart.js** with React integration for data visualization
- **Context API** for state management

### Backend
- **Node.js** with **Express** for RESTful API endpoints
- **PostgreSQL** for persistent data storage
- **Prisma ORM** for type-safe database access
- **JWT & Session-based Authentication** for secure user management
- **External API Integration**: USDA Food Database and Edamam Recipe API

### DevOps
- **Firebase** for frontend hosting
- **Railway** for backend hosting
- **Git** workflow with feature branching

## Project Structure

```
nutron/
│
├── frontend/           # React frontend application
│   ├── src/            # Source files
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── assets/     # Static assets
│   │   └── ...
│   ├── public/         # Public assets
│   └── ...
│
├── backend/            # Express backend application
│   ├── src/            # Source files
│   │   ├── routes/     # API route definitions
│   │   ├── models/     # Data models and database logic
│   │   └── ...
│   ├── prisma/         # Prisma ORM configuration and migrations
│   └── ...
│
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nutron.git
   cd nutron
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   
   # Configure your .env file with the following:
   # DATABASE_URL="postgresql://username:password@localhost:5432/nutron"
   # SECRET_SESSION="your-secret-key"
   # USDA_KEY="your-usda-api-key"
   # EDAMAM_APP_ID="your-edamam-app-id"
   # EDAMAM_APP_KEY="your-edamam-app-key"
   
   npx prisma migrate dev
   npm start
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Future Enhancements

- Social features for sharing recipes and progress
- AI-powered meal suggestions based on user preferences
- Mobile app version using React Native
- Meal planning calendar and grocery list generator
- Integration with fitness trackers and health apps

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- USDA Food Database API for comprehensive food nutritional data
- Edamam Recipe API for recipe search capabilities
- All open-source libraries and tools that made this project possible

---

*Developed with ❤️ by [Your Name]*
