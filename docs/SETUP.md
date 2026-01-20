# 🛠️ StartGenie AI - Setup Guide

Complete guide to set up and run StartGenie AI locally.

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18.x or higher
- **Python** 3.9 or higher
- **Git**
- **MongoDB** (or MongoDB Atlas account)

### API Keys & Accounts
- **OpenAI API Key** - [Get here](https://platform.openai.com/api-keys)
- **MongoDB Atlas** (Free tier) - [Sign up](https://www.mongodb.com/cloud/atlas/register)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shubhamjadhav0715/startgenie-ai.git
cd startgenie-ai
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Create `.env` file in the `backend` directory:

```bash
cp ../.env.example .env
```

Edit `.env` and add your credentials:

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here
MONGODB_URI=your-mongodb-connection-string
SECRET_KEY=your-secret-key-here

# Optional (defaults provided)
MONGODB_DB_NAME=startgenie_db
OPENAI_MODEL=gpt-3.5-turbo
```

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

### 4. Run Backend

```bash
# From backend directory
uvicorn app.main:app --reload

# Server will start at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 5. Frontend Setup (Coming Soon)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend will start at http://localhost:3000
```

---

## 🐳 Docker Setup (Recommended)

### Using Docker Compose

```bash
# From project root
docker-compose up --build

# Services will start:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:3000
# - MongoDB: localhost:27017
```

### Individual Services

**Backend only:**
```bash
cd backend
docker build -t startgenie-backend .
docker run -p 8000:8000 --env-file .env startgenie-backend
```

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster
3. Create database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string
6. Add to `.env` file

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/startgenie_db?retryWrites=true&w=majority
```

### Option 2: Local MongoDB

```bash
# Install MongoDB locally
# macOS:
brew install mongodb-community

# Ubuntu:
sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data/directory

# Connection string:
MONGODB_URI=mongodb://localhost:27017
```

---

## 🔑 Getting API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/signup)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add to `.env` file

**Cost Estimate:**
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- Expected: $20-50/month for development

---

## ✅ Verify Installation

### Test Backend

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

### Test API Documentation

Visit: http://localhost:8000/docs

You should see interactive Swagger UI with all API endpoints.

### Test Database Connection

Check backend logs for:
```
✅ Connected to MongoDB: startgenie_db
✅ Database indexes created
```

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
pytest

# With coverage
pytest --cov=app tests/

# Frontend tests (coming soon)
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "No module named 'app'"**
```bash
# Make sure you're in the backend directory
cd backend
# And virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

**Error: "Could not connect to MongoDB"**
- Check MongoDB is running
- Verify connection string in `.env`
- Check network/firewall settings
- For Atlas: Whitelist your IP

**Error: "Invalid OpenAI API key"**
- Verify key in `.env` file
- Check key hasn't expired
- Ensure no extra spaces in key

### Port already in use

```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Dependencies installation fails

```bash
# Upgrade pip
pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# Try installing problematic packages individually
pip install faiss-cpu
```

---

## 📚 Next Steps

1. ✅ Backend running
2. ✅ Database connected
3. ✅ API accessible
4. 🔄 Test API endpoints in Swagger UI
5. 🔄 Create test user account
6. 🔄 Generate test blueprint
7. 🔄 Set up frontend (coming soon)

---

## 🆘 Getting Help

- **Documentation**: Check `/docs` folder
- **API Docs**: http://localhost:8000/docs
- **Issues**: [GitHub Issues](https://github.com/shubhamjadhav0715/startgenie-ai/issues)
- **Email**: itsmeshubzz07@gmail.com

---

## 🔄 Updating

```bash
# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
pip install -r requirements.txt --upgrade

# Update frontend dependencies (when available)
cd frontend
npm install
```

---

**Setup complete! Ready to build amazing startup blueprints! 🚀**
