# adashe-digital

A web application for managing rotating savings groups (Ajo/Esusu). Create groups, track contributions, manage payouts, and collect payments — all in one place.
 
---
 
## 🚀 Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS | - not concluded
| Backend | Node.js + Express | - not conluded
| Database | PostgreSQL + Prisma | - not concluded
| Payments | Paystack | - not concluded
| Auth | Supabase Auth | - not concluded
 
---
 
## 📁 Project Structure
 
```
adashe-digital/
├── client/          # React frontend
├── server/          # Node.js backend
├── .github/         # PR templates & workflows
├── .env.example     # Environment variable keys (no secrets)
├── .gitignore
└── README.md
```
 
---
 
## ⚙️ Getting Started
 
### Prerequisites
 
- Node.js v18+
- PostgreSQL
- A Paystack account
 
### 1. Clone the repo
 
```bash
git clone https://github.com/your-username/ajo-app.git
cd ajo-app
```
 
### 2. Set up environment variables
 
```bash
cp .env.example .env
```
 
Fill in the required values in `.env` (see `.env.example` for all keys).
 
### 3. Install dependencies
 
```bash
# Install backend dependencies
cd server && npm install
 
# Install frontend dependencies
cd ../client && npm install
```
 
### 4. Set up the database
 
```bash
cd server
npx prisma migrate dev
```
 
### 5. Run the app
 
```bash
# Run backend (from /server)
npm run dev
 
# Run frontend (from /client)
npm run dev
```
 
The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.
 
---
 
## 🌿 Branch Strategy
 
```
main          → stable, production-ready code only
dev           → integration branch — merge features here first
feature/xxx   → individual feature branches
fix/xxx       → bug fix branches
```
 
- All PRs should target `dev`, not `main`
- `dev` is merged into `main` only for releases
- Branch names should be descriptive: `feature/paystack-integration`, `fix/payout-calculation`
 
---
 
## 🤝 Contributing
 
1. Pull the latest `dev` branch before starting work
   ```bash
   git checkout dev && git pull origin dev
   ```
 
2. Create a new branch from `dev`
   ```bash
   git checkout -b feature/your-feature-name
   ```
 
3. Make your changes, commit clearly
   ```bash
   git commit -m "feat: add payout rotation logic"
   ```
 
4. Push your branch and open a PR targeting `dev`
   ```bash
   git push origin feature/your-feature-name
   ```
 
5. Request a review from at least one teammate before merging
 
---
 
## 📝 Commit Message Convention
 
We follow a simple convention for commit messages:
 
| Prefix | Use for |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `chore:` | Config, tooling, or dependency updates |
| `docs:` | Documentation changes |
| `refactor:` | Code restructuring without behaviour change |
 
---
 
## 👥 Team
 
| Name | Role |
|---|---|
| TBD | Frontend |
| TBD | Backend |
| TBD | Design |
 
---
 
## 📄 License
 
MIT
