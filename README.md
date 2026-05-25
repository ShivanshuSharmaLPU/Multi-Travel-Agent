# ✈️ VoyageAI — Multi-Agent Travel Planner

A modern AI-powered travel planning system built using a **Supervisor Agent architecture** with multiple specialized agents, real-time streaming (SSE), and a premium dark UI.

It generates complete travel plans including itinerary, budget, weather-aware suggestions, transport, hotels, and safety guidance.

---

## 🚀 System Architecture

```
User
↓
React Frontend (Vite + Tailwind)
↓
Node.js / Express Backend
↓
FastAPI AI Service (Python)
↓
Supervisor Agent (Orchestrator)
├── Weather Agent
├── Transport Agent
├── Hotel Agent
├── Budget Agent
├── Itinerary Agent
├── Local Guide Agent
└── Safety Agent
↓
Final Travel Plan (SSE Streaming)
```

---

## 🏗 Project Structure

```
travel-planner/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Hero, features, CTA
│   │   │   ├── Planner.jsx         # Trip input form
│   │   │   ├── Workflow.jsx        # Live agent SSE stream
│   │   │   └── TravelPlan.jsx      # Final results + PDF
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── AgentCard.jsx       # Real-time agent status
│   │   └── services/
│   │       ├── api.js              # Axios + SSE client
│   │       └── pdfService.js       # jsPDF generator
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── routes/travel.js
│   ├── controllers/
│   │   └── travelController.js     # SSE proxy to FastAPI
│   └── package.json
│
├── ai_service/
│   ├── main.py                     # FastAPI app + SSE endpoint
│   ├── supervisor/
│   │   └── supervisor.py           # Orchestrator agent
│   ├── agents/
│   │   ├── transport_agent.py
│   │   ├── hotel_agent.py
│   │   ├── weather_agent.py        # Open-Meteo integration
│   │   ├── budget_agent.py
│   │   ├── itinerary_agent.py
│   │   ├── local_guide_agent.py
│   │   └── safety_agent.py
│   ├── tools/
│   │   └── langchain_tools.py      # LangChain @tool functions
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| PDF | jsPDF + jsPDF-AutoTable |
| Backend | Node.js, Express |
| AI Service | Python, FastAPI |
| AI Framework | Agno-compatible Supervisor pattern |
| LLM | Groq (Llama 3.1 8B) |
| AI Tools | LangChain |
| Weather | Open-Meteo API |
| Streaming | Server-Sent Events (SSE) |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Multi-Agent System** | 7 specialized agents + 1 supervisor |
| **Live SSE Streaming** | Watch agents work in real-time |
| **Weather Integration** | Real forecasts from Open-Meteo API |
| **LangChain Tools** | Reusable tool functions for agents |
| **PDF Download** | Professional travel plan PDF |
| **Dark UI** | Glassmorphism + gradient design |
| **Responsive** | Works on mobile and desktop |

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Clone Repository

```bash
git clone https://github.com/ShivanshuSharmaLPU/Multi-Travel-Agent.git
cd Multi-Travel-Agent
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
# Runs on http://localhost:3000
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
AI_SERVICE_URL=http://localhost:8000
```

Run:

```bash
npm run dev
# Runs on http://localhost:5000
```

### 4. AI Service Setup

```bash
cd ai_service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```
GROQ_API_KEY=your_groq_api_key
OPENMETEO_BASE_URL=https://api.open-meteo.com/v1/forecast
```

Run:

```bash
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

### 5. Open the App

Navigate to **http://localhost:3000** in your browser.

---

## 🔑 Getting a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Create a new API key
4. Add it to `ai_service/.env` as `GROQ_API_KEY=gsk_...`

> **Note:** The app works without a Groq API key using built-in fallback data. Weather (Open-Meteo) works without any API key.

---

## 🧪 LangChain Tools

Located in `ai_service/tools/langchain_tools.py`:

- `calculate_budget` — Budget allocation by percentages
- `fetch_weather_coordinates` — City → lat/lon lookup
- `compare_transport_options` — Multi-mode transport comparison
- `get_safety_info` — Destination safety tips

---

## 🔄 Agent Communication Flow

```
User Input → Supervisor
├──→ WeatherAgent    (runs first, informs others)
├──→ TransportAgent  (uses budget + destination)
├──→ HotelAgent      (uses nightly budget)
├──→ BudgetAgent     (uses transport + hotel costs)
├──→ ItineraryAgent  (uses weather data)
├──→ LocalGuideAgent
└──→ SafetyAgent
↓
Supervisor synthesizes all outputs
↓
Final Travel Plan (SSE "done" event)
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| "Cannot connect to AI service" | Make sure FastAPI is running on port 8000; check `AI_SERVICE_URL` in backend `.env` |
| "Groq API error" | Verify `GROQ_API_KEY` in `ai_service/.env`; app still works with fallback data |
| Weather shows "Unavailable" | Check internet connection; Open-Meteo is free and needs no API key |

---

## 📄 License

MIT License — free to use and modify.

---

## 👨‍💻 Author

**Shivanshu Sharma**