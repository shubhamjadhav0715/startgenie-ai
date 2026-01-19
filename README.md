# 🚀 StartGenie AI

**AI-Driven Startup Blueprint Generator using RAG and LLMs**

> "One Idea. One Genie. Infinite Possibilities."

Transform raw startup ideas into complete, investor-ready business blueprints in seconds using Retrieval-Augmented Generation (RAG) technology.

---

## 📌 Overview

**StartGenie AI** is an intelligent platform that helps entrepreneurs convert their startup ideas into comprehensive business plans. Using advanced RAG (Retrieval-Augmented Generation) and Large Language Models, it automatically generates detailed, data-driven blueprints tailored to the Indian startup ecosystem.

### 🎯 Key Features

- 🧠 **AI-Powered Blueprint Generation** - Convert ideas into structured business plans
- 📊 **Live Market Data** - Real-time data from Startup India, DPIIT, Invest India
- 💰 **Budget & Funding Suggestions** - Personalized financial planning
- 📑 **Pitch Deck Auto-Generator** - Export-ready PPT presentations
- 🎯 **SWOT Analysis** - Comprehensive strength/weakness assessment
- 🏛️ **Government Scheme Finder** - Discover applicable subsidies and grants
- 📍 **Location-Based Trends** - Regional startup insights
- 💬 **AI Chat Assistant** - Interactive "StartupGPT" for refinements

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (React Framework)
- TypeScript
- Tailwind CSS
- Shadcn UI Components

**Backend:**
- Python FastAPI
- LangChain (RAG Framework)
- OpenAI API (GPT-4/3.5)
- FAISS (Vector Database)
- MongoDB Atlas

**Deployment:**
- Vercel (Frontend)
- Railway (Backend)
- Docker

### System Flow

```
User Input → RAG Engine → Data Retrieval → LLM Generation → Structured Blueprint
```

---

## 📋 Generated Blueprint Sections

1. **Startup Overview** - Name suggestions, problem statement, solution, UVP
2. **Market Analysis** - Target audience, market size, trends, competitors
3. **Business Model** - Revenue streams, pricing, customer acquisition
4. **SWOT Analysis** - Strengths, weaknesses, opportunities, threats
5. **Budget Estimation** - Setup costs, operational expenses, projections
6. **Funding & Investment** - Angel/VC options, government schemes
7. **Legal & Compliance** - Registration, licenses, taxation (India-specific)
8. **Go-To-Market Strategy** - Launch plan, marketing channels, risk mitigation
9. **Action Roadmap** - 0-3, 3-6, 6-12 month plans
10. **Export Summary** - PDF/PPT/Email ready format

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- OpenAI API key

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/shubhamjadhav0715/startgenie-ai.git
cd startgenie-ai
```

**2. Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**3. Setup Frontend**
```bash
cd frontend
npm install
```

**4. Environment Variables**

Create `.env` files:

**Backend (.env):**
```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**5. Run the Application**

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3000`

---

## 📁 Project Structure

```
startgenie-ai/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   ├── components/         # Reusable components
│   │   ├── lib/                # Utilities
│   │   └── styles/             # CSS files
│   └── package.json
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── api/                # API routes
│   │   ├── rag/                # RAG engine
│   │   ├── models/             # Database models
│   │   └── utils/              # Helper functions
│   ├── data/                   # Datasets
│   └── requirements.txt
│
├── docs/                        # Documentation
├── tests/                       # Test files
└── README.md
```

---

## 🔧 RAG Pipeline

### Data Sources

- **Startup India Portal** - Government schemes and policies
- **DPIIT** - Startup recognition and benefits
- **Invest India** - Investment opportunities
- **MSME Portal** - Subsidies and loans
- **Market Research** - Industry reports and trends

### Pipeline Flow

1. **Data Collection** - Scrape and collect startup ecosystem data
2. **Document Processing** - Clean, chunk, and structure data
3. **Embedding Generation** - Convert text to vectors using OpenAI
4. **Vector Storage** - Store in FAISS for fast retrieval
5. **Query Processing** - User query → relevant data retrieval
6. **Generation** - LLM creates blueprint using retrieved context

---

## 🎨 Features in Detail

### 1. Blueprint Generation
- Input: Simple startup idea description
- Output: Complete 10-section business plan
- Time: 30-60 seconds
- Format: Structured JSON/Markdown

### 2. AI Chat Assistant
- Conversational interface
- Clarifying questions
- Iterative refinement
- Context-aware responses

### 3. Export Options
- **PDF** - Professional report format
- **PPT** - Pitch deck ready
- **Email** - Shareable summary

### 4. Dashboard
- Save multiple blueprints
- Version history
- Edit and update
- Usage analytics

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 🚢 Deployment

### Using Docker

```bash
docker-compose up --build
```

### Manual Deployment

**Frontend (Vercel):**
```bash
cd frontend
vercel deploy
```

**Backend (Railway):**
```bash
cd backend
railway up
```

---

## 📊 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/blueprint/generate` - Generate blueprint
- `GET /api/blueprint/{id}` - Retrieve blueprint
- `POST /api/chat/message` - Chat with AI

---

## 🎓 Academic Project

**Institution:** Genba Sopanrao Moze, College of Engineering, Balewadi

**Team:**
- Sanika
- Pranjal
- Bariya
- Zeemat

**Project Type:** Final Year Engineering Project

**Technologies Demonstrated:**
- Retrieval-Augmented Generation (RAG)
- Large Language Models (LLMs)
- Vector Databases
- Full-Stack Web Development
- Cloud Deployment

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📧 Contact

For questions or support:
- Email: bariyashaikh90@gmail.com
- GitHub:(https://github.com/Bariyashaikh)

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- LangChain for RAG framework
- Startup India for data resources
- Genba Sopanrao Moze College of Engineering

---

**Built with campus project hub**
