---
description: How to run the StayLio AI Agent
---
1. Open a new terminal.
2. Navigate to the agent directory:
   cd staylio-ai-agent
3. Install dependencies:
   pip install -r requirements.txt
4. Set your Groq API Key (PowerShell):
   $env:GROQ_API_KEY="your_api_key_here"
5. Run the agent:
   python app.py
6. Ensure your Spring Boot backend is running on port 8080.
7. Ensure your React frontend is running.
