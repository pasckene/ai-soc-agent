
# How to Run the RedShield SOC Project

This guide provides instructions on how to set up and run the RedShield AI: Autonomous Intelligence Coordinator project.

## Prerequisites
*   Python 3.10+
*   Node.js 18+
*   `uv` (Python package manager - install via `pip install uv` if not present)

## Installation and Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-repo/ai-soc-agent.git
    cd ai-soc-agent
    ```
    *(Note: Replace `https://github.com/your-repo/ai-soc-agent.git` with the actual repository URL if it differs.)*

2.  **Setup Backend**
    *   Navigate to the backend directory (if not already there after cloning).
    *   Install Python dependencies using `uv`:
        ```bash
        uv sync
        ```
    *   Ensure your environment variable `GEMINI_API_KEY` is set with your Google API key. If you have an `.env.example` file, you'll need to create a `.env` file and populate it.
    *   Start the backend development server:
        ```bash
        uv run uvicorn backend.main:app --reload
        ```

3.  **Setup Frontend**
    *   Navigate to the frontend directory:
        ```bash
        cd frontend
        ```
    *   Install Node.js dependencies:
        ```bash
        npm install
        ```
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```

## Running the Application

Once both the backend and frontend are running, you can access the application. Typically, the backend will run on a port like `8000` and the frontend on a port like `5173` (Vite default). Open your browser and navigate to the frontend's address (e.g., `http://localhost:5173`) to use the application.

## Key Features to Note

*   **AI Forensics**: Real-time alert analysis by LLMs.
*   **Attack Rewind**: Visual playback of attack sequences.
*   **War Room**: Collaborative incident response space.
*   **One-Click Containment**: Direct execution of remediation playbooks.
*   **Forensic Activity Blog**: Detailed event logging and MITRE ATT&CK mapping.

---
*This guide is based on the information available in the project's README.md file.*
