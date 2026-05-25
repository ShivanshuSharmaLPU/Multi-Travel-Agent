# VoyageAI — Multi-Agent Travel Planner

A modern AI-powered travel planner using a **Supervisor Agent** architecture with 7 specialized agents, real-time SSE streaming, and a premium dark-themed UI.

---

## 🏗 Architecture

```
React Frontend (Port 3000)
        ↓
Express Backend (Port 5000)
        ↓
FastAPI AI Service (Port 8000)
        ↓
Supervisor Agent
   ├── Transport Agent  (LangChain tool + Groq)
   ├── Hotel Agent      (Groq LLM)
   ├── Weather Agent    (Open-Meteo API + LangChain)
   ├── Budget Agent     (LangChain tool + Groq)
   ├── Itinerary Agent  (Groq LLM, weather-aware)
   ├── Local Guide      (Groq LLM)
   └── Safety Agent     (LangChain tool + Groq)
```

---

## 📁 Project Structure

```
travel-planner/
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Hero, features, CTA
│   │   │   ├── Planner.jsx      # Trip input form
│   │   │   ├── Workflow.jsx     # Live agent SSE stream
│   │   │   └── TravelPlan.jsx   # Final results + PDF
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── AgentCard.jsx    # Real-time agent status
│   │   └── services/
│   │       ├── api.js           # Axios + SSE client
│   │       └── pdfService.js    # jsPDF generator
│   └── package.json
│
├── backend/                     # Node.js + Express
│   ├── server.js
│   ├── routes/travel.js
│   ├── controllers/
│   │   └── travelController.js  # SSE proxy to FastAPI
│   └── package.json
│
├── ai_service/                  # Python FastAPI
│   ├── main.py                  # FastAPI app + SSE endpoint
│   ├── supervisor/
│   │   └── supervisor.py        # Orchestrator agent
│   ├── agents/
│   │   ├── transport_agent.py
│   │   ├── hotel_agent.py
│   │   ├── weather_agent.py     # Open-Meteo integration
│   │   ├── budget_agent.py
│   │   ├── itinerary_agent.py
│   │   ├── local_guide_agent.py
│   │   └── safety_agent.py
│   ├── tools/
│   │   └── langchain_tools.py   # LangChain @tool functions
│   └── requirements.txt
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

---

### Step 1: Clone & Setup

```bash
git clone <your-repo>
cd travel-planner
```

---

### Step 2: Frontend Setup

```bash
cd frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:5000" > .env

npm run dev
# Runs on http://localhost:3000
```

---

### Step 3: Backend Setup

```bash
cd backend
npm install

# Create .env
echo "PORT=5000" > .env
echo "AI_SERVICE_URL=http://localhost:8000" >> .env

npm run dev
# Runs on http://localhost:5000
```

---

### Step 4: AI Service Setup

```bash
cd ai_service

# Create virtual environment
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env with your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env
echo "OPENMETEO_BASE_URL=https://api.open-meteo.com/v1/forecast" >> .env

# Start FastAPI
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

---

### Step 5: Open the App

Navigate to **http://localhost:3000** in your browser.

---

## 🔑 Getting a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Create a new API key
4. Add it to `ai_service/.env` as `GROQ_API_KEY=gsk_...`

> **Note:** The app works without a Groq API key using built-in fallback data. Weather (Open-Meteo) works without any API key.

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

## 🧪 LangChain Tools

Located in `ai_service/tools/langchain_tools.py`:

- `calculate_budget` — Budget allocation by percentages
- `fetch_weather_coordinates` — City → lat/lon lookup
- `compare_transport_options` — Multi-mode transport comparison
- `get_safety_info` — Destination safety tips

---

## 🌤 Open-Meteo API

Used in `WeatherAgent` (no API key required):
- Temperature forecast (max/min per day)
- Rain probability
- WMO weather code → human-readable condition
- Packing recommendations based on weather

---

## 🤖 Agent Communication Flow

```
User Input → Supervisor
                ├──→ WeatherAgent   (runs first, informs others)
                ├──→ TransportAgent (uses budget + destination)
                ├──→ HotelAgent     (uses nightly budget)
                ├──→ BudgetAgent    (uses transport + hotel costs)
                ├──→ ItineraryAgent (uses weather data)
                ├──→ LocalGuideAgent
                └──→ SafetyAgent
                         ↓
                  Supervisor synthesizes all outputs
                         ↓
                    Final Travel Plan (SSE "done" event)
```

---

## 🎨 Tech Stack

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

## 🐛 Troubleshooting

**"Cannot connect to AI service"**
- Make sure FastAPI is running: `uvicorn main:app --port 8000`
- Check `AI_SERVICE_URL` in backend `.env`

**"Groq API error"**  
- Verify `GROQ_API_KEY` in `ai_service/.env`
- The app still works with fallback data without a key

**Weather shows "Unavailable"**
- Check internet connection (Open-Meteo is free, no key needed)
- City may not be in the coordinates database; it uses a default

---

## 📄 License

MIT — Free to use and modify.
