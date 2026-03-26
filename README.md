# 🔭 GitHub Project Visualizer

A full-stack web application that visualizes GitHub repositories — contributors, commit activity, language breakdowns, issue trends, and more — through interactive charts and graphs.

Built with **FastAPI** on the backend and **React** on the frontend.

---

## ✨ Features

- 🔍 Search any public GitHub repository by URL or `owner/repo` slug
- 📊 Visualize commit activity over time
- 🧑‍💻 Contributor breakdown with commit counts
- 🌐 Language composition pie/bar charts
- 🐛 Open vs closed issues and pull request trends
- ⭐ Star and fork history over time
- 📁 Repository metadata overview (license, topics, last pushed, etc.)
- 🔐 GitHub OAuth support for higher API rate limits

---

## 🎯 Target Users

- Open-source maintainers
- Engineering managers
- Contributors

---

## 💡 Common Use Cases

- "Is this repo active or dead?"
- "Who are the key contributors?"
- "Are issues being resolved quickly?"

---

## 🗂️ Project Structure

```
github-visualizer/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── routes/           # API route handlers
│   │   │   ├── repo.py
│   │   │   ├── commits.py
│   │   │   └── contributors.py
│   │   ├── services/         # GitHub API integration logic
│   │   │   └── github.py
│   │   ├── schemas/          # Pydantic models
│   │   └── config.py         # Environment config
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── api/              # Axios/fetch wrappers
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A GitHub Personal Access Token (for higher rate limits)

---

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Add your GITHUB_TOKEN to .env

# Start the dev server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### Running with Docker

```bash
docker-compose up --build
```

| Service   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:5173  |
| Backend   | http://localhost:8000  |
| API Docs  | http://localhost:8000/docs |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable          | Description                        | Required |
|-------------------|------------------------------------|----------|
| `GITHUB_TOKEN`    | GitHub Personal Access Token       | Yes      |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated)     | No       |

### Frontend (`frontend/.env`)

| Variable            | Description              | Required |
|---------------------|--------------------------|----------|
| `VITE_API_BASE_URL` | Base URL of the backend  | Yes      |

---

## 📡 API Endpoints

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| `GET`  | `/repo/{owner}/{repo}`                | Repository metadata      |
| `GET`  | `/repo/{owner}/{repo}/commits`        | Commit activity          |
| `GET`  | `/repo/{owner}/{repo}/contributors`   | Contributor stats        |
| `GET`  | `/repo/{owner}/{repo}/languages`      | Language breakdown       |
| `GET`  | `/repo/{owner}/{repo}/issues`         | Issue and PR trends      |

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React, TypeScript, Recharts / Chart.js  |
| Backend   | FastAPI, httpx, Pydantic                |
| Auth      | GitHub Personal Access Token            |
| Packaging | Docker, docker-compose                  |

---

## 🧪 Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.
