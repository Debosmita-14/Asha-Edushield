# 🛡️ ASHA EduShield 2.0 – AI Campus Safety Operating System

> An AI-powered multi-agent campus safety platform designed to provide real-time incident reporting, emergency response, women safety assistance, safe travel recommendations, wellness monitoring, analytics, and AI-driven decision support.

---

## 📌 Overview

ASHA EduShield 2.0 is an intelligent Campus Safety Operating System that integrates AI agents, real-time maps, emergency response, voice assistance, analytics, and incident management into a single platform.

The system helps students, faculty, security personnel, administrators, and emergency responders communicate efficiently during emergencies while improving campus safety through AI-powered automation.

---

# ✨ Key Features

### 🚨 Emergency Response
- One-tap SOS
- Emergency dispatch
- Live incident reporting
- AI-assisted emergency classification
- Priority-based response

### 👩 Women Safety
- Women Safety Dashboard
- Safe Route Suggestions
- Emergency Contacts
- Panic Button
- Safety Tips
- Nearby Safe Zones

### 🤖 AI Assistant
- Google Gemini AI Integration
- Campus Safety Assistant
- AI Incident Analysis
- AI Recommendations
- Question Answering

### 🎙 Voice Assistant
- ElevenLabs Voice Integration
- Voice Commands
- Text-to-Speech
- Emergency Voice Interaction

### 🗺 Maps & Navigation
- Live Campus Map
- Leaflet Map Integration
- OpenStreetMap Tiles
- Safe Route Navigation
- Incident Location Tracking

### 📊 Analytics Dashboard
- Incident Statistics
- Safety Analytics
- Response Time Analysis
- Department Performance
- Risk Visualization

### 📚 Additional Modules
- Classroom Monitoring
- Wellness Tracking
- Safe Travel
- Online Examination Safety
- Agent Management
- Reports Generation

---

# 🏗 System Architecture

```
                    User
                      │
                      ▼
              Frontend (HTML/CSS/JS)
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
   AI Assistant              Voice Assistant
 (Gemini API)              (ElevenLabs API)
          │                        │
          └───────────┬────────────┘
                      ▼
              Node.js Proxy Server
                      │
          ┌───────────┴────────────┐
          ▼                        ▼
      Gemini API             ElevenLabs API
                      │
                      ▼
             Campus Safety Modules
```

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)

---

## Backend

- Node.js
- HTTP Server
- HTTPS Proxy

---

## AI Services

- Google Gemini API
- ElevenLabs API

---

## Maps

- Leaflet.js
- OpenStreetMap

---

## Icons

- Font Awesome

---

# 📂 Project Structure

```
hexafalls/
│
├── index.html                 # Main Application
├── server.js                  # Node.js API Proxy
├── .env                       # API Keys
├── css/
│     └── style.css
│
├── js/
│     ├── app.js
│     ├── ai.js
│     ├── agents.js
│     ├── voiceagent.js
│     ├── store.js
│     ├── data.js
│     │
│     └── pages/
│            ├── dashboard.js
│            ├── incidents.js
│            ├── dispatch.js
│            ├── analytics.js
│            ├── map.js
│            ├── report.js
│            ├── sos.js
│            ├── wellness.js
│            ├── womensafety.js
│            ├── classroom.js
│            ├── safetravel.js
│            ├── exam.js
│            └── agentspage.js
```

---

# 📄 Module Description

## Dashboard
Displays overall campus safety status, recent incidents, alerts, and analytics.

---

## Incident Management
- Create incidents
- Track incidents
- View incident details
- Incident history

---

## Dispatch Center
Handles emergency response assignment and response tracking.

---

## SOS Module
Provides instant emergency reporting with location sharing.

---

## Women Safety Module
Includes dedicated features for women's security such as:

- Emergency SOS
- Safe Routes
- Nearby Safe Locations
- Safety Recommendations
- Emergency Contacts

---

## Wellness Module
Tracks health and wellness related information for students.

---

## Classroom Module
Monitors classroom safety and classroom incidents.

---

## Safe Travel
Provides AI-generated safer travel recommendations.

---

## Analytics
Visualizes:

- Incident trends
- Response performance
- Risk analysis
- Safety statistics

---

## Reports
Generate reports of incidents and campus safety activities.

---

## AI Agents
Displays available AI agents responsible for different safety tasks.

---

# 🤖 AI Integration

## Google Gemini API

Used for:

- AI Chat Assistant
- Incident Analysis
- Risk Prediction
- Safety Recommendations
- Question Answering

---

## ElevenLabs API

Used for:

- Voice Assistant
- Speech Generation
- Emergency Voice Alerts

---

# 🗺 Maps Integration

The application uses

- Leaflet.js
- OpenStreetMap

Features include:

- Campus Map
- Incident Locations
- Live Marker Updates
- Route Visualization

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```
GEMINI_KEY=YOUR_GEMINI_API_KEY

ELEVEN_KEY=YOUR_ELEVENLABS_API_KEY

ELEVEN_VOICE=VOICE_ID
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/asha-edushield.git
```

---

## Go to Project

```bash
cd asha-edushield
```

---

## Add Environment Variables

Create

```
.env
```

Add API keys.

---

## Start Server

```bash
node server.js
```

---

Open

```
http://localhost:8080
```

---

# 👥 Demo Login

The application provides demo role-based login.

Example roles include:

- Student
- Faculty
- Security Officer
- Administrator

No password is required in demo mode.

---

# 📈 Future Improvements

- Firebase Authentication
- Real-time Database
- Push Notifications
- SMS Integration
- WhatsApp Alerts
- Face Recognition
- CCTV AI Detection
- Mobile Application
- Multi-language Support
- Predictive Crime Analytics

---

# 🎯 Use Cases

- College Campuses
- Universities
- Schools
- Educational Institutions
- Corporate Campuses
- Smart Cities

---

# 📸 Screens

- Login Page
- Dashboard
- Incident Reporting
- Women Safety
- SOS
- Dispatch Center
- AI Assistant
- Analytics
- Reports
- Campus Map

---

# 📜 License

This project is developed for educational and demonstration purposes.

---

# 👨‍💻 Developed By

**Kumaresh Pradhan**

B.Tech CSE (AI & ML)

Brainware University

---

## ⭐ If you like this project, consider giving it a star!
