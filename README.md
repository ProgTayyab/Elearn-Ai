# 🧠 NeuralLearn

> **An AI-powered adaptive learning platform that creates personalized learning paths, generates dynamic educational content, and helps students track and improve their learning progress.**



## 🌟 Overview

**NeuralLearn** is an AI-powered adaptive learning application built with **React Native and Expo**.

The goal of NeuralLearn is to make learning more personalized by using **Google Gemini AI** to generate structured courses, learning paths, lessons, quizzes, and practical tasks based on a student's interests, skill level, and learning goals.

The mobile application communicates with a backend API that manages authentication, courses, student progress, AI-powered content generation, and analytics.

---

## ✨ Key Features

### 🤖 AI-Powered Course Generation

Students can enter any topic they want to learn, and NeuralLearn uses Gemini AI to generate a structured learning path.

For example:

> **"I want to learn Machine Learning"**

The platform can generate a personalized curriculum such as:

```text
Week 1 — Python & Mathematics
Week 2 — Data Preprocessing
Week 3 — Regression
Week 4 — Classification
Week 5 — Clustering
Week 6 — Model Evaluation
Week 7 — Neural Networks
Week 8 — Final Project
```

### 📚 Dynamic Learning Content

Courses can include AI-generated:

* 📖 Lessons
* 📝 Summaries
* 🎥 Video resources
* ❓ Quizzes
* 💻 Practical assignments
* 🎯 Learning objectives
* 🧩 Assessments

### 📊 Progress Tracking

Students can track their learning progress through:

* Course completion
* Module progress
* Lesson completion
* Quiz performance
* Assignment completion
* Learning statistics
* Overall progress

### 🧠 Adaptive Learning

NeuralLearn is designed to adapt the learning experience according to student performance and activity.

The system can be extended to provide:

* Personalized recommendations
* Difficulty adjustments
* Weak-topic identification
* Performance predictions
* Learning-risk detection

### 📱 Mobile-First Experience

NeuralLearn is built specifically for mobile using:

* React Native
* Expo
* Modern mobile UI/UX
* REST API integration

The application can run on **Android and iOS**.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────┐
                    │     Student      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React Native App │
                    │      + Expo      │
                    └────────┬─────────┘
                             │
                         REST API
                             │
                             ▼
                    ┌──────────────────┐
                    │   Express.js     │
                    │    Backend       │
                    └───────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌───────────┐  ┌─────────────┐
        │ Prisma   │  │ Gemini AI │  │ ML Service  │
        │   ORM    │  │           │  │  FastAPI    │
        └────┬─────┘  └───────────┘  └─────────────┘
             │
             ▼
        ┌──────────┐
        │ Database │
        │ SQLite / │
        │PostgreSQL│
        └──────────┘
```

---

## 📂 Project Structure

```text
NeuralLearn/
│
├── src/                    # 📱 React Native / Expo application
│   ├── components/         # Reusable UI components
│   ├── screens/            # Application screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and external services
│   ├── hooks/              # Custom React hooks
│   └── ...
│
├── backend/                # ⚙️ Express.js REST API
│   ├── src/
│   ├── prisma/
│   └── ...
│
├── ml-service/             # 🧠 Optional FastAPI ML service
│
├── SETUP.md                # 📖 Setup instructions
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer                | Technology             |
| -------------------- | ---------------------- |
| Mobile App           | React Native           |
| Development Platform | Expo                   |
| Backend              | Node.js + Express.js   |
| ORM                  | Prisma                 |
| Database             | SQLite / PostgreSQL    |
| Generative AI        | Google Gemini          |
| ML Service           | Python + FastAPI       |
| Communication        | REST API               |
| Authentication       | Backend Authentication |
| Version Control      | Git + GitHub           |

---

## 🚀 Getting Started

For detailed installation and configuration instructions, see:

**[SETUP.md](./SETUP.md)**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd NeuralLearn
```

### 2. Install Mobile Dependencies

```bash
npm install
```

### 3. Start the Expo Development Server

```bash
npx expo start
```

You can then run NeuralLearn using:

* 📱 Expo Go
* 🤖 Android Emulator
* 🍎 iOS Simulator

---

## ⚙️ Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Configure the required environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url
```

Initialize the database:

```bash
npm run setup
```

Start the development server:

```bash
npm run dev
```

---

## 🔐 Environment Variables

Create the required `.env` files according to the setup instructions.

Example:

```env
GEMINI_API_KEY=your_api_key
DATABASE_URL=your_database_url
```

> **Never commit API keys, passwords, or ****`.env`**** files to GitHub.**

---

## 🗺️ Roadmap

* [ ] Personalized AI Tutor
* [ ] AI-generated study plans
* [ ] Adaptive difficulty
* [ ] Intelligent course recommendations
* [ ] AI-powered Q&A
* [ ] Spaced repetition
* [ ] Gamification & achievements
* [ ] Learning streaks
* [ ] Advanced student analytics
* [ ] Student performance prediction
* [ ] Push notifications
* [ ] Offline learning
* [ ] Android release
* [ ] iOS release
* [ ] Production deployment

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you find **NeuralLearn** useful, consider giving the repository a ⭐.

**Built with React Native, Expo, Node.js, and Generative AI.**
