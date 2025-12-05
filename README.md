# 🧠 AI Mind Playground

### **Analyze how you use AI — Are you growing your brain, or outsourcing your thinking?**

AI Mind Playground is a smart analytics tool that evaluates your prompts and interactions with Large Language Models (ChatGPT, Gemini, Claude, etc.) to determine whether they **expand your understanding** or **increase dependency**.

This project offers two powerful modes:

- **Playground Mode** — Analyze single prompts in real-time and receive AI-powered insight.
- **Session Analyzer** — Paste your entire chat history and get a full report on learning vs dependency.

---

## 🚀 Live Demo  
🔗 https://ai-mind-playground.vercel.app/

---

## 🎯 Why This Project Exists

AI tools are changing how humans think, write, learn, and solve problems.

But here's the real question:

> **Are we becoming smarter with AI, or more dependent on it?**

This project tracks your AI usage pattern and returns metrics such as:
- **Brain Growth Score**
- **Dependency Score**
- **Detected Prompt Type**
- **Insight Suggestion**
- **Session Breakdown & Averages**

---

## 🧩 Core Features

| Feature | Description |
|--------|------------|
| 🔎 Prompt Intelligence | Classifies your prompt (Learning, Delegation, Creation, Trivial). |
| 📊 Brain Growth Analytics | Shows how much your prompt leads to actual skill development. |
| 🔁 Dependency Score | Detects if you're outsourcing thinking & task completion. |
| 🧠 Gemini AI Integration | Uses `gemini-2.5-flash` for intelligent reporting. |
| 🧮 Local Fallback AI | Works even if API fails using rule-based heuristic scoring. |
| 📈 Session Summary | Paste chat history & evaluate overall learning vs dependency. |
| 📋 Prompt History Log | Tracks past prompts during your session. |
| 📉 Charts | Recharts-based visual session insights. |

---

## 🛠 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | **Next.js 14**, React, Tailwind CSS |
| Backend API | Next.js Route Handlers |
| AI Model | **Google Gemini (`gemini-2.5-flash`)** |
| Charts | Recharts |
| Deployment | **Vercel** |
| Environment | `.env.local` |

---

## ⚙ Environment Setup

Create `.env.local`:

```

GEMINI_API_KEY=your_google_gemini_api_key_here

````

Install packages:

```bash
npm install
````

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
npm start
```

---

## 📂 Folder Structure

```
ai-mind-playground/
│── app/
│   ├── page.tsx           # Playground analyzer UI
│   ├── session-analyzer/  # Session level analyzer
│   │   └── page.tsx
│   └── api/
│       └── analyze/
│           └── route.ts   # Gemini AI prompt scoring
│
│── public/
│
│── package.json
│── README.md
│── .env.local (ignored)
```

---

## 🚀 Deployment Guide (Quick)

This project is optimized for **Vercel**.

1. Push to GitHub
2. Import to Vercel
3. Add `GEMINI_API_KEY` in Vercel > Project Settings > Environment Variables
4. Deploy 🎉

---

## 🌟 Use Cases

✔ AI learning pattern detection
✔ Productivity vs dependency analysis
✔ Research on AI-human cognition
✔ Educational tools
✔ AI safety / ethical studies
✔ Student learning dashboards

---

## 📢 Future Enhancements (Open to contributors)

* 🧮 Exportable PDF Report
* 📅 Multi-session tracking history (local + cloud)
* 🤖 AI coach suggesting better prompts
* 🔥 Leaderboard mode (Gamified brain growth)
* 🔐 Auth + personal dashboard

---

## 🤝 Contributing

Pull requests are welcome!
If you find bugs, open an issue with details.

---

## ⭐ Support the Project

If this project inspired you, drop a ⭐ on GitHub!
Your star helps this project grow and reach more developers.

```
⭐ Go to top → Click “Star”
```

---

## Made with ❤️ and 🔥

By **AI + Human Mind Collaboration**