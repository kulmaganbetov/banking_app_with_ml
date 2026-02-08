# SecureBank — AI-Protected Online Banking Platform

## Business Idea

SecureBank is an online banking platform for Kazakhstan's market that integrates an AI-based ransomware detection and prevention module. The platform provides standard banking features (account management, transfers, transaction history) while monitoring every transaction in real time through a machine-learning pipeline that detects and blocks ransomware-like automated exfiltration patterns.

The system targets a growing threat landscape where compromised endpoints initiate rapid, automated fund transfers to attacker-controlled accounts. SecureBank's AI module analyzes behavioral signals — transaction amount, frequency, recipient novelty, and automation indicators — to intercept malicious activity before funds leave the account.

## Architecture

```
banking_app_with_ml/
├── server/                        # Node.js + Express backend
│   └── src/
│       ├── index.ts               # Express app entry point
│       ├── types/index.ts         # Shared TypeScript interfaces
│       ├── data/
│       │   ├── store.ts           # In-memory data store
│       │   └── seed.ts            # Demo data seeder (normal + fraud)
│       ├── middleware/
│       │   └── auth.ts            # Token-based auth middleware
│       ├── routes/
│       │   ├── auth.ts            # POST /api/auth/login, GET /api/auth/me
│       │   ├── transactions.ts    # POST/GET /api/transactions
│       │   └── security.ts        # GET /api/security/logs, /api/security/status
│       ├── services/
│       │   └── transactionService.ts  # Business logic orchestration
│       └── ml/                    # AI Security Module (mock ML)
│           ├── featureExtractor.ts    # Extracts risk features from transactions
│           ├── riskScorer.ts          # Weighted risk score computation
│           ├── modelMock.ts           # Mock ML model (predict + classify)
│           └── decisionEngine.ts      # Orchestrates analysis → block/allow
│
├── client/                        # React + Vite frontend
│   └── src/
│       ├── main.tsx               # React entry point
│       ├── App.tsx                # Router setup
│       ├── index.css              # Tailwind + theme config
│       ├── types/index.ts         # Frontend type definitions
│       ├── services/api.ts        # API client
│       ├── hooks/useAuth.ts       # Auth state management
│       └── components/
│           ├── layout/
│           │   ├── AppLayout.tsx   # Authenticated layout with sidebar
│           │   └── Sidebar.tsx     # Navigation sidebar
│           └── pages/
│               ├── Landing.tsx     # Public landing page
│               ├── Login.tsx       # Login form
│               ├── Dashboard.tsx   # Account overview + recent transactions
│               ├── Transactions.tsx    # Send money + history table
│               └── SecurityCenter.tsx  # AI threat monitoring + charts
│
└── README.md
```

## AI Module Role

The `/server/src/ml/` directory implements a modular, pipeline-based security system:

1. **Feature Extractor** (`featureExtractor.ts`) — Converts raw transaction data into risk signals:
   - `amountRisk`: Flags unusually large transfers (>500K KZT)
   - `frequencyRisk`: Detects burst patterns (multiple transactions in 5-minute windows)
   - `newRecipientRisk`: Identifies first-time recipients
   - `automatedBehaviorRisk`: Flags programmatic/automated transaction origins

2. **Risk Scorer** (`riskScorer.ts`) — Computes a weighted aggregate score (0–1) from extracted features, plus a confidence metric based on feature agreement.

3. **Model Mock** (`modelMock.ts`) — Simulates an ML classifier. Applies the risk threshold (0.55) and classifies threat type (e.g., `automated-ransomware-pattern`, `rapid-fire-exfiltration`, `high-value-suspicious-transfer`). Designed as a drop-in interface: replace `predict()` with a real model call without changing any upstream or downstream code.

4. **Decision Engine** (`decisionEngine.ts`) — Orchestrates the full pipeline: extract → score → predict → decide. Returns a structured `MLDecision` with risk score, label, confidence, threat classification, and action taken.

**Replacing Mock with Real ML**: The `ModelInput → ModelOutput` interface in `modelMock.ts` is the integration boundary. Swap the `predict()` function body with an HTTP call to a real model server (e.g., TensorFlow Serving, ONNX Runtime) without modifying the decision engine, routes, or frontend.

## Running Locally

### Backend
```bash
cd server
npm install
npm run dev      # Starts on port 3001
```

### Frontend
```bash
cd client
npm install
npm run dev      # Starts on port 5173, proxies /api to :3001
```

### Demo Credentials
- Username: `demo`
- Password: `demo123`

## Seed Data

The application seeds 8 transactions on startup:
- 5 normal transactions (utilities, food delivery, tuition)
- 3 fraudulent transactions (large amounts, unknown recipients, automated flag) — these get **blocked** by the AI module

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Authenticate and receive token |
| GET | `/api/auth/me` | Yes | Get current user profile + balance |
| POST | `/api/transactions` | Yes | Create a transaction (ML-analyzed) |
| GET | `/api/transactions` | Yes | List user's transactions |
| GET | `/api/security/logs` | Yes | AI decision audit log |
| GET | `/api/security/status` | Yes | Overall threat level + statistics |

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS v4, Framer Motion, Recharts, React Router
- **Backend**: Node.js, Express, TypeScript
- **Styling**: Dark mode, glassmorphism, cybersecurity accents
- **State**: In-memory store (replaceable with any database)
