# VEDA_X Public Demo Chat

This app provides a public-facing, ChatGPT-like interface for VEDA_X onboarding questions while keeping the internal onboarding protocol and prompt logic on the server side.

## Features
- ChatGPT-like dark UI
- Public website for external demos
- Private prompt storage in a server-side secret or local-only file
- Public-safe fallback responses when no API key is configured
- Local health endpoint at `/api/health`

## Run locally

```bash
cd veda_x_public_chat
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# add your OpenAI key to .env
python app.py
```

Open:

```text
http://127.0.0.1:5001
```

## Important security note
The hidden onboarding content is intended to remain server-side. Do not put it in browser code, frontend templates, or public static files. In deployment, prefer a host secret such as `VEDA_PRIVATE_PROMPT` instead of committing the onboarding markdown to the repository.

## Environment variables

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
VEDA_PRIVATE_PROMPT=your_private_prompt_here
PORT=5001
```

For production or free-hosted deployments, keep `VEDA_PRIVATE_PROMPT` in the hosting platform's secret manager and leave the repo free of the private markdown content. The app will fall back to the public-safe default if no private prompt is configured.
