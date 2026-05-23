# Askwiseo 🧠📄 — AI-Powered PDF to Knowledge Base System

Askwiseo transforms static PDFs into smart, queryable knowledge bases using powerful AI models. Built with a modern stack and optimized for speed and usability, Askwiseo is your go-to solution for turning documents into interactive, searchable experiences.

---

## 🚀 Live Demo

Coming soon!

---

## ✨ Features

- 📄 Upload and parse PDFs into structured content
- 🔍 Query the knowledge base in natural language
- 🤖 Powered by advanced LLMs (OpenAI / Hugging Face)
- 🧠 Semantic search with vector embeddings (Pinecone)
- ⚙️ Fast and scalable backend (FastAPI)
- 💾 Supabase for user management and document storage
- 🌐 Sleek and modern UI built with Next.js & Shadcn/UI

---

## 🛠 Tech Stack

### Frontend:
- **Next.js** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **TypeScript**

### Backend:
- **FastAPI** (Python)
- **LangChain** (for LLM integration and agent logic)
- **Pinecone** (vector database for embeddings)
- **Supabase** (auth + DB for metadata)

### AI Models:
- **OpenAI GPT-4** or **Hugging Face Transformers** (configurable)

---

## 🧬 How It Works (Internal Architecture)

```
User Uploads PDF 
    | 
    v 
Text Extractor (PyMuPDF / PDFplumber) 
    | 
    v 
Chunking & Embedding Generator (LangChain + OpenAI/HF) 
    | 
    v 
Embeddings stored in Pinecone (vector DB) 
    | 
    v 
User asks a question 
    -> LangChain QA chain retrieves chunks 
    -> LLM generates answer 
    -> Response shown in frontend
```

**Bonus:** Metadata is stored in Supabase (file name, upload date, user ID) for traceability.

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/askwiseo.git
cd askwiseo
```

### 2. Set up environment variables

Create a `.env` file for both frontend and backend:

#### `.env` (FastAPI)

```env
OPENAI_API_KEY=your_key
PINECONE_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

#### `.env.local` (Next.js)

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Run the app locally

The frontend calls same-origin `/api/*` routes. In development, Next.js rewrites those
requests to the FastAPI backend at `http://127.0.0.1:8000`, so both services must run.

```bash
npm install
npm run dev
```

This starts:

- Next.js on `http://localhost:3000`
- FastAPI on `http://127.0.0.1:8000`

Make sure `backend/firebase-service-account.json` exists, or set
`FIREBASE_SERVICE_ACCOUNT_JSON` for the backend, so plan and document data can be read
from Firebase.

### 4. Run the backend only (FastAPI)

```bash
cd backend
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 5. Run the frontend only (Next.js)

```bash
npm run dev:web
```

---
## 🚀 Deployment

### Vercel (Frontend)

- Ensure `vercel.json` is at the repository root.
- Add `SENTRY_DSN` secret in Vercel dashboard (Settings → Environment Variables).
- Connect the repo to Vercel; each push to `main` triggers a new deployment.

### Render (Backend + Frontend)

- Ensure `render.yaml` is at the repository root.
- Add the `SENTRY_DSN` secret in Render (Environment → Secrets).
- Create a new service from the repo; Render will automatically build the Docker backend and static frontend.
- Both services will be redeployed on every push to `main`.

> **Note:** The backend validates required production environment variables at startup. Set `ENVIRONMENT=production` in your deployment environment to enable the checks.


## 🗂 Folder Structure

```bash
askwiseo/
├── backend/
│   ├── main.py
│   └── services/
├── frontend/
│   ├── app/
│   └── components/
├── README.md
├── .env
```

---

## 🤝 Contributing

Got ideas to improve Askwiseo? Open a pull request or start a discussion!

---

## 📄 License

MIT License.

---

## 🙋‍♂️ Author

Built with 💡 by Arun Kumar  
Email: arunkumar.ai.engineer@gmail.com
Project: Askwiseo
