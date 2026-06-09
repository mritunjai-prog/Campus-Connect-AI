# 🚀 Campus Connect AI
> **Next-Generation Placement & Recruitment Ecosystem Powered by Artificial Intelligence**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-cyan)
![Firebase](https://img.shields.io/badge/Firebase-10.0-yellow)
![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange)

**Campus Connect AI** is an advanced, fully integrated platform designed to bridge the gap between students, college administration (TPOs), and corporate recruiters. By combining robust Role-Based Access Control (RBAC) with cutting-edge Generative AI features, it automates resume parsing, simulates technical mock interviews, and provides deep predictive analytics for college placements.

---

## ✨ Key Features

### 🎓 For Students
* **Career Discovery Hub:** Browse, filter, and apply for active placement drives with a single click.
* **AI Resume Intelligence:** Upload a PDF/DOCX resume and let our AI parser automatically extract your skills, education, and experience to keep your profile up-to-date.
* **AI Mock Interview Cockpit:** Practice technical interviews in an animated, interactive environment. The AI (powered by Google Gemini 1.5 Flash) simulates real recruiter questions, analyzes your responses, and provides a highly accurate aggregate score with constructive feedback.
* **Application Tracking:** Real-time visibility into application statuses (Pending, Shortlisted, Selected, Rejected).

### 🏢 For Recruiters
* **Verified Corporate Accounts:** Secure registration process manually verified by the college administration.
* **Drive Management:** Create and post placement drives, specifying role requirements, minimum CGPA, and branch eligibility.
* **Applicant Pipeline:** Review candidate profiles, download resumes natively, and move candidates through the hiring pipeline.

### 🏛️ For TPOs (Training & Placement Officers)
* **Double-Gate Security:** Administrative access protected by both Firebase Identity and a secondary dynamic Security Access Key.
* **Central Command:** Monitor all active students, oversee placement drives, and manually approve/reject pending recruiter accounts.
* **Predictive Analytics:** Interactive data visualization (powered by Recharts) showing placement success rates, high-demand skills, and active engagement metrics.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Frontend** | React.js, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide React, Three.js (Drei/Fiber) |
| **Backend API** | Node.js, Express.js |
| **Database & Auth** | Firebase Authentication, Cloud Firestore |
| **Storage** | Persistent Local Disk Storage (`/uploads`) |
| **Artificial Intelligence**| Google GenAI SDK (`gemini-1.5-flash`) |

---

## ⚙️ Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- A **Firebase** project with Firestore and Authentication (Email/Password & Google) enabled.
- A **Google AI Studio** API Key for Gemini features.

---

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/mritunjai-prog/Campus-Connect-AI.git
cd Campus-Connect-AI
```

**2. Install Dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root directory and add the following keys:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key
JWT_SECRET=your_super_secret_jwt_key
PORT=3000
```
*(Ensure your Firebase client config is placed inside `src/lib/firebase.ts` or `firebase-applet-config.json`)*

**4. Start the Development Server**
```bash
npm run dev
```
The application will launch concurrently. Visit `http://localhost:3000` in your browser.

---

## ☁️ Deployment
This application is fully containerized and cloud-ready. 

To deploy to any cloud provider (e.g., Northflank, Render, Railway), simply use the included `Dockerfile` which automatically compiles the Vite frontend and Esbuild server into a production-ready monolith.

```bash
docker build -t campus-connect .
docker run -p 3000:3000 campus-connect
```
*Note: Make sure to map a persistent volume to `/app/uploads` in your cloud provider so that student resumes and photos persist across server restarts.*

---

## 🔒 Security Architecture
- **JWT Session Tokens:** All backend endpoints are guarded by HTTP-only or Bearer token middleware.
- **Strict RBAC Middleware:** Frontend routes use guards to instantly bounce users who do not match the required Firestore role status.
- **Single Source of Truth:** The client-side never dictates permissions; the Node.js backend exclusively reads from Firestore to authorize sensitive actions.

---

## 📄 License
This project is licensed under the MIT License.
