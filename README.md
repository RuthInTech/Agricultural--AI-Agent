# 🌾 AgriGuide — AI Extension Agent & Decision Support System

**AgriGuide** is an intelligent AI-driven agricultural decision-support and extension system designed to empower farmers and field extension agents. By integrating real-time telemetry, location-based case histories, domain-specific retrieval, and LLM reasoning workflows, AgriGuide delivers precise, actionable, and cited agricultural advisories.

---

## 🚀 Key Features

- **🤖 Autonomous AI Agent Workflow**: Processes complex field inputs, cross-references location data and historical logs, and synthesizes cited diagnostic advisories.
- **📍 Telemetry & Location Telemetry Integration**: Evaluates specific site telemetry data (e.g., rainfall, soil condition) to ground AI advice in actual environmental conditions.
- **📜 Historical Case Matching**: Reads prior farmer interaction records and diagnostic logs to provide continuity and detect recurring crop issues.
- **📊 Modern & Responsive Dashboard**: Built with modern UI patterns including real-time status indicators, interactive presets for demonstration/judging, and structured feedback forms.
- **🔐 JWT-Authenticated REST API**: Secure backend communication powered by Django Rest Framework and SimpleJWT.

---

## 🛠️ Architecture & Tech Stack

### **Frontend**
- **Framework**: React (Vite)
- **Styling**: Modern CSS with glassmorphism design, CSS Grid/Flexbox
- **Icons**: Lucide React (`lucide-react`)

### **Backend**
- **Framework**: Django & Django REST Framework (DRF)
- **Authentication**: `djangorestframework-simplejwt`
- **CORS Handling**: `django-cors-headers`
- **Database**: SQLite (Default) / PostgreSQL ready

---

## 📦 Project Structure

```text
AgriGuide/
├── backend/
│   ├── config/              # Django settings & base URL routing
│   ├── users/               # Authentication & user profile endpoints
│   ├── manage.py            # Django CLI utility
│   └── requirements.txt     # Python backend dependencies
└── frontend/
    ├── src/
    │   ├── components/      # FarmerReportForm, MyFarm, Navigation, etc.
    │   ├── data/            # Telemetry & Case history demo data
    │   ├── App.jsx          # Main frontend entry point
    │   └── main.jsx         # React DOM rendering
    ├── package.json         # Node.js dependencies
    └── vite.config.js       # Vite configuration
```

---

## ⚙️ Quick Start Setup

### Prerequisites
- **Python**: 3.10+ installed
- **Node.js**: v18+ and `npm` installed

---

### 1. Backend Setup (Django)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python Virtual Environment:
   ```powershell
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install django djangorestframework django-cors-headers djangorestframework-simplejwt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Run the development server:
   ```bash
   python manage.py runserver
   ```
   *The Django API will be live at `http://128.0.0.1:8000/`.*

---

### 2. Frontend Setup (React / Vite)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web application will be accessible at `http://localhost:5173/`.*

---

## 🧪 Testing Test Presets

The interface includes pre-configured **Test Presets** for quick demonstration and evaluation:

1. **GUIDE-001 (Yellow Leaves)**: Pre-fills diagnostic data for nitrogen/waterlogging issues under heavy rainfall in `SITE-A`.
2. **CASE-002 (Pest / Holes)**: Pre-fills diagnostic data for pest damage observations during dry spell conditions in `SITE-B`.

Click any preset button at the top of the **Farmer Report Form** to automatically populate validated input fields and run the AI agent workflow.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.