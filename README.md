# Pastebin-Lite

A lightweight Pastebin-like web application where users can create text pastes and share a link to view them.  
Each paste can optionally have a **time-based expiry (TTL)** and/or a **maximum view limit**.


**Stack:** **MERN** — **M**ongoDB, **E**xpress, **R**eact, **N**ode.js.

- **Backend:** Node.js + Express (REST API) + MongoDB  
- **Frontend:** React (Vite)  
- **Persistence:** MongoDB (e.g. MongoDB Atlas)

## Running locally

1. **Prerequisites:** Node.js 18+ and a MongoDB database (e.g. [MongoDB Atlas](https://cloud.mongodb.com) free tier).

2. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd pastebin-lite
   npm run install:all
   ```
   Or install root, then `npm install` in `backend/` and `frontend/` separately.

3. **Environment:** Create `.env.local` in the project root (or copy from `.env.example`) and set your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/pastebin?retryWrites=true&w=majority
   ```
   Do not commit `.env.local` or any real credentials.

4. **Start the app (development):**
   ```bash
   npm run dev
   ```
   - **Backend** (Express) runs on **http://localhost:5000**
   - **Frontend** (React) runs on **http://localhost:3000** and proxies `/api` and `/p` to the backend.


---



## 🚀 Live Demo

- **Frontend (Create Paste UI)**  
  👉 https://pastebin-lite-aganitha.netlify.app

- **Backend (Paste View + API)**  
  👉 https://pastebin-lite-aganitha-4.onrender.com

- **Health Check**  
  👉 https://pastebin-lite-aganitha-4.onrender.com/api/healthz

> Generated paste links look like:  
> `https://pastebin-lite-aganitha-4.onrender.com/p/<paste_id>`

---

## 🧰 Tech Stack (MERN)

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MongoDB (MongoDB Atlas)
- **Deployment:**  
  - Frontend → Netlify  
  - Backend → Render  

---

## 🏗️ Architecture Overview

- **Frontend (Netlify)**  
  - Used only to create pastes  
  - Sends API requests to backend  

- **Backend (Render)**  
  - Stores and retrieves pastes from MongoDB  
  - Generates shareable paste URLs  
  - Serves paste content as an HTML page (`/p/:id`)  

- **Database (MongoDB Atlas)**  
  - Stores paste content, expiry, and view count  

This design avoids SPA routing issues and keeps paste links simple and shareable.

---

## 📁 Project Structure

Pastebin-Lite_Aganitha/
│
├── frontend/ # React (Vite)
│ ├── src/
│ │ ├── App.jsx # Paste creation UI
│ │ ├── main.jsx
│ │ └── index.css
│ ├── public/
│ │ └── _redirects # Netlify SPA routing fix
│ ├── index.html
│ ├── vite.config.js
│ └── package.json
│
├── backend/ # Node + Express
│ ├── lib/
│ │ ├── db.js # MongoDB connection & health check
│ │ └── paste.js # Paste logic
│ ├── index.js # Express app & routes
│ └── package.json
│
├── .env.example
├── README.md
└── package.json


---

## 🔌 API Routes

| Method | Route | Description |
|------|------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/pastes` | Create a new paste |
| GET | `/api/pastes/:id` | Fetch paste (counts as one view) |
| GET | `/p/:id` | View paste as HTML |

---

## 🗄️ Database Schema (MongoDB)

Collection: **`pastes`**

Fields:
- `content` – paste text  
- `createdAt` – creation time  
- `expiresAt` – optional expiry time  
- `maxViews` – optional view limit  
- `viewCount` – number of times viewed  

View consumption is handled atomically to avoid race conditions.

---

## 🧪 Run Locally

### Prerequisites
- Node.js **18+**
- MongoDB (Atlas free tier recommended)

### Clone & Install
```bash
git clone https://github.com/SrinuTaddi18/Pastebin-Lite_Aganitha.git
cd Pastebin-Lite_Aganitha

