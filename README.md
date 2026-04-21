# 🛡️ RedShield AI: Autonomous Intelligence Coordinator (AIC)

RedShield AI is a next-generation, AI-native Security Operations Center (SOC) agent designed to bridge the gap between threat detection and autonomous remediation. Unlike traditional SIEMs that inundate analysts with raw logs, RedShield AI acts as an **Autonomous Intelligence Coordinator**, providing real-time forensic storytelling and one-click containment capabilities.

## 🚀 Key Features

### 1. 🧠 Autonomous AI Forensics
- **Instant Analysis**: Every security alert is automatically processed by state-of-the-art LLMs (Gemini 1.5 Pro/Flash) to generate executive summaries and actionable technical insights.
- **Remediation Playbooks**: AI suggests specific containment steps based on the observed TTPs (Tactics, Techniques, and Procedures).

### 2. 🎬 Attack Rewind (Forensic Time-Machine)
- **Visual Playback**: An interactive Force-Directed Graph that visualizes the blast radius of an attack.
- **Temporal Slider**: Use the "Attack Rewind" slider to playback the chronological sequence of an incident, watching lateral movement unfold node-by-node.

### 3. ⚔️ Collaborative War Room
- **Crisis Command Center**: A dedicated workspace for major incident response featuring a Global Incident Timeline.
- **AI Scribe**: A real-time collaborative chat where analysts can log their actions, and the AI automatically summarizes and tracks the incident lifecycle.

### 4. ⚡ One-Click Containment (SOAR 2.0)
- **Direct Remediation**: Execute security playbooks (e.g., *Isolate Host*, *Block IP*) directly from the alerts list.
- **Feedback Loop**: Real-time visual feedback on containment execution status.

### 5. 📔 Forensic Activity Blog
- **Long-form Investigation**: A professional, article-style feed of all security events, complete with detailed forensic metadata, MITRE ATT&CK mappings, and source IP analysis.

### 6. 🔌 External Agent Integration
- **Webhook Ingestion**: External agents (Wazuh, EDR, Cloud Sensors) can push alerts directly to the platform via a REST API at `/api/alerts`.
- **AI Enrichment**: Every externally ingested alert undergoes the same AI triage and MITRE mapping as internal simulations.

## 🛠️ Technical Architecture

### **Backend (Python)**
- **FastAPI**: High-performance asynchronous API framework.
- **SQLAlchemy + SQLite**: Robust data persistence for alerts and user accounts.
- **JWT Security**: Professional-grade authentication and session management.
- **AI Integration**: Multi-model support for Google Generative AI (Gemini) and Groq (Llama 3).

### **Frontend (React)**
- **Vite + React Router**: Ultra-fast routing and modern component architecture.
- **Framer Motion**: Smooth, premium UI transitions and micro-animations.
- **React-Force-Graph**: Interactive 2D visualization of complex network relationships.
- **Shadcn-inspired Design**: A dark-mode, glass-morphism aesthetic tailored for high-intensity SOC environments.

## 🚦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- `uv` (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/ai-soc-agent.git
   cd ai-soc-agent
   ```

2. **Setup Backend**
   ```bash
   uv sync
   # Ensure .env is configured with GEMINI_API_KEY
   uv run uvicorn backend.main:app --reload
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📈 Marketplace Differentiation
RedShield AI stands out by focusing on **Actionable Intelligence** rather than raw data. By combining **Visual Forensics** (Rewind Graph) with **Direct Remediation** (Containment Buttons) and **Collaborative Support** (War Room), it transforms a standard security tool into a true partner for the SOC team.

---
*Built with ❤️ for the next generation of Security Analysts.*
