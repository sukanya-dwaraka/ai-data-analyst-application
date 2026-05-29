# AI Data Analyst

Upload CSV/Excel datasets and get AI-generated insights, charts, and summaries — powered by Claude AI.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + Multer + PapaParse
- **AI:** Anthropic Claude API (claude-sonnet-4)

## Project Structure

```
ai-data-analyst/
├── backend/
│   ├── routes/
│   │   ├── upload.js       # File upload + CSV/Excel parsing
│   │   └── analyze.js      # AI analysis + insight generation
│   ├── uploads/            # Uploaded files stored here
│   ├── server.js           # Express app entry point
│   ├── .env.example        # Copy to .env and add your API key
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Topbar.jsx      # Header with upload button
    │   │   ├── Sidebar.jsx     # Dataset overview + column list
    │   │   ├── ChatPanel.jsx   # Chat interface
    │   │   ├── ResultsPanel.jsx # Results/Chart/Insights tabs
    │   │   └── UploadModal.jsx # Drag & drop upload modal
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

## Setup

### 1. Clone / download the project

### 2. Backend setup

```bash
cd backend

# Copy env file and add your Anthropic API key
cp .env.example .env
# Edit .env and set: ANTHROPIC_API_KEY=sk-ant-...

# Install dependencies
npm install

# Start backend (port 4000)
npm run dev
```

Get your API key at: https://console.anthropic.com

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend (port 5173)
npm run dev
```

### 4. Open the app

Visit **http://localhost:5173** in your browser.

## Usage

1. Click **Upload Dataset** and drop a CSV or Excel file
2. The sidebar will show your columns and dataset info
3. Type a question in the chat, e.g.:
   - *"Show summary statistics"*
   - *"Which columns have missing values?"*
   - *"Show top 5 rows"*
   - *"Show distribution of categories"*
4. Results appear in the **Result**, **Chart**, and **Insights** tabs
5. Click **Download Result** to export the table as CSV

## Supported File Formats

- `.csv` — Comma-separated values
- `.xlsx` — Excel 2007+
- `.xls` — Excel 97-2003


Live : https://ai-data-analyst-application-yoi6.vercel.app/

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a dataset file |
| POST | `/api/analyze` | Analyze data with a query |
| GET | `/health` | Health check |

