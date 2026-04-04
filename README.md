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
│   ├── pytest.ini          # pytest-asyncio / test discovery
│   ├── tests/              # Backend pytest suite
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

### Backend (pytest)

From the `backend` directory, install dependencies (includes `pytest` and `pytest-asyncio` from `requirements.txt`), then run:

```bash
cd backend
pip install -r requirements.txt

# Run the full suite under tests/
python -m pytest

# Verbose output
python -m pytest -v

# Single file (e.g. repository snapshots & analytics)
python -m pytest tests/test_repository_analytics_and_store.py -v
```

**Notes**

- Config lives in `backend/pytest.ini` (async mode, `testpaths = tests`).
- Tests such as `test_repository_analytics_and_store.py` use **in-memory SQLite** via `tests/conftest.py`; they do **not** require `DATABASE_URL` or a running Postgres instance.

### Frontend

The SPA lives in `client/`. There is no `npm run test` script yet; use typecheck/build and lint:

```bash
cd client
npm install
npm run build
npm run lint
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


Backend
POST /api/repo/{owner}/{repo}/generate-readme (optional JSON body) builds a structured README from:

Live GitHub repo metadata, languages, contributors, search-based issue/PR counts
Stored snapshots when present (star/fork deltas via get_repo_analytics)
Existing build_insights_summary (health score, trend, risks, merge stats)
app/services/readme_generator.py — markdown template (summary, metrics table, activity, issues/PRs, languages, contributors, contributing hints). HTML is produced with the markdown package when export_format is html or both.

app/schemas/readme.py — GenerateReadmeRequest / GenerateReadmeResponse (template_id reserved for later templates).

Optional OpenAI — use_openai: true plus key from openai_api_key in the body or server OPENAI_API_KEY (app/config.py). Keys are not logged.

InsightsSummaryResponse now includes closed_prs_sampled, merged_prs_sampled, merge_rate so the README can cite merge behavior without extra GitHub calls.

openapi.yaml — path and changelog entry for the new endpoint.

requirements.txt — markdown>=3.5.

Bugfix — Removed the duplicate get_github_client import in analytics.py so the OAuth-aware client from app.deps.github_client is used.

Frontend
GenerateReadmeModal — opened from the nav Generate README button: export mode, optional OpenAI + per-request API key, Generate, preview, Copy Markdown, download .md / .html, plus the server’s PDF hint (print HTML → Save as PDF).

generateReadme() in api.ts — encodeURIComponent on owner/repo, 90s timeout. With USE_MOCK, it still returns mock content so the flow works offline.

PDF / templates / AI
PDF: No server-side PDF library; response includes pdf_export_hint describing browser print-to-PDF from the HTML file.
Templates: template_id is accepted and echoed; only default is implemented today.
AI: Heuristic copy is always included; OpenAI adds an “AI-assisted perspective” section when enabled and a key is available.
To try it against the real API, set USE_MOCK to false in client/src/services/api.ts, run the backend with GitHub auth as you already do, and call POST /api/repo/{owner}/{repo}/generate-readme with {} or a body like:

{
  "export_format": "both",
  "use_openai": false
}
