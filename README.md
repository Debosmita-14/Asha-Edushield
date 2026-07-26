# 🛡 ASHA EduShield 2.0 — AI Campus Safety OS

An AI-powered campus-safety platform prototype: **15 AI agents** for real-time incident detection, emergency dispatch, women's safety, exam integrity, classroom monitoring, and wellness — with human-in-the-loop review.

Built with vanilla **HTML / CSS / JavaScript** and a tiny dependency-free Node proxy server that keeps API keys off the client.

## ✨ Features

- **Classroom Guardian** — Gemini Vision analyzes uploaded classroom photos for risk signals, with an OpenCV-style bounding-box overlay. Human-in-the-loop: the AI flags, a person decides.
- **Advanced Exam Integrity** — Gemini Vision reviews exam-hall frames for integrity concerns and dangerous objects, generating a Suspicious Activity Report for a proctor. Weapons trigger an immediate emergency alert.
- **Emergency Dispatch & Alert System** — multi-channel alert dispatch (email / SMS / WhatsApp) with escalation.
- **Voice SOS + Walk With ASHA** — voice agent for students (ElevenLabs).
- **Women's Safety, Wellness, Safe Travel, Analytics, Incidents, Map** and more.
- **Role-based views** — Student, Faculty, Security, Admin.

> This is a hackathon/demo prototype. AI outputs are assistive and require human review; nothing is fabricated when a model is unavailable — the UI reports the failure honestly.

## 🚀 Getting started

### 1. Prerequisites
- [Node.js](https://nodejs.org) (any recent version — no npm packages required)

### 2. Configure API keys
Copy the template and add your own keys:

```bash
cp .env.example .env
```

Then edit `.env`:

| Key            | Purpose                        | Get one at |
|----------------|--------------------------------|------------|
| `GEMINI_KEY`   | Gemini Vision + text           | https://aistudio.google.com/apikey |
| `ELEVEN_KEY`   | Voice agent (optional)         | https://elevenlabs.io |
| `RESEND_KEY`   | Emergency email (optional)     | https://resend.com |
| `TWILIO_*`     | SMS / WhatsApp alerts (optional)| https://twilio.com |

The server reads keys **server-side only** — they are never exposed to the browser. Without a key, the relevant feature falls back to simulated output.

### 3. Run

```bash
node server.js
```

Open **http://localhost:8080**, pick any role, and click **Enter Platform**.

## ☁️ Deploy to Vercel

The app runs on Vercel with **zero build step**. The `/api/*` routes are Vercel serverless
functions (`api/gemini.js`, `api/eleven.js`, `api/alert.js`) — the same proxy logic as
`server.js`, so keys stay server-side.

1. **Import** `Debosmita-14/Asha-Edushield` into Vercel (New Project → Import Git Repository).
2. **Framework preset:** `Other`. Leave Build Command and Output Directory **empty** — it's static + serverless.
3. **Add Environment Variables** (Project → Settings → Environment Variables) — this is the step that makes Gemini Vision work in production:

   | Name           | Required | Value |
   |----------------|----------|-------|
   | `GEMINI_KEY`   | ✅       | your Gemini API key |
   | `ELEVEN_KEY`   | optional | your ElevenLabs key |
   | `ELEVEN_VOICE` | optional | voice id (defaults to a built-in) |
   | `RESEND_KEY`   | optional | for real emergency emails |
   | `TWILIO_SID` / `TWILIO_TOKEN` / `TWILIO_FROM` | optional | for SMS / WhatsApp |

4. **Deploy** (or **Redeploy** after adding the vars — env vars only apply to new deployments).

> Without `GEMINI_KEY` set in Vercel, the vision features return an honest "vision unavailable"
> notice instead of fabricating results.

## 🏗 Architecture

```
index.html          # single-page shell + login
css/style.css       # all styling
server.js           # dependency-free static server + /api/* proxy (hides keys)
js/
  app.js            # UI core, routing, role grid, live alerts
  ai.js             # Gemini proxy client (Vision + text) with model fallback
  agents.js         # the 15 AI agents registry
  data.js           # demo/seed data + role config
  store.js          # live event store → incidents
  alertsystem.js    # multi-channel emergency dispatch + escalation
  voiceagent.js     # voice SOS (ElevenLabs)
  pages/            # one module per screen (classroom, exam, dispatch, …)
```

### Gemini model fallback
`ai.js` tries a chain of Gemini models (`gemini-flash-lite-latest` → fallbacks) and retries on quota (`429`) / availability (`404`/`503`) errors, so a single exhausted model doesn't break Vision.

## 🔒 Security

- **Secrets live only in `.env`** (git-ignored) and are read server-side by `server.js`.
- API keys are **never** committed or shipped to the client.
- Use `.env.example` as the template; keep your real `.env` local.

## 📝 License

Prototype for educational / hackathon use.
