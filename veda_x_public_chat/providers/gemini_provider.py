import json
import urllib.error
import urllib.request
from typing import Optional

from .base import BaseChatProvider


class GeminiChatProvider(BaseChatProvider):
    name = "gemini"

    def __init__(self, api_key: Optional[str], model_name: str, system_prompt: str):
        super().__init__(model_name=model_name, system_prompt=system_prompt)
        self.api_key = api_key

    def is_enabled(self) -> bool:
        return bool(self.api_key)

    def generate(self, message: str) -> str:
        if not self.api_key:
            raise ValueError("Gemini API key is not configured")

        fallback_model = "gemini-3.5-flash-lite"
        attempted_models = []

        for model_name in [self.model_name, fallback_model]:
            if model_name in attempted_models:
                continue
            attempted_models.append(model_name)

            endpoint = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model_name}:generateContent?key={self.api_key}"
            )

            prompt = f"{self.system_prompt}\n\nUser: {message}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 800,
                },
            }

            req = urllib.request.Request(
                endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )

            try:
                with urllib.request.urlopen(req, timeout=60) as response:
                    data = json.loads(response.read().decode("utf-8"))
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="replace")
                if model_name != fallback_model:
                    continue
                raise RuntimeError(f"Gemini API error: {body}") from exc
            except (TimeoutError, urllib.error.URLError, OSError) as exc:
                if model_name != fallback_model:
                    continue
                raise RuntimeError(f"Gemini API request timed out or failed: {exc}") from exc

            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                self.model_name = model_name
                return text.strip() or "I’m unable to generate a response right now."
            except (KeyError, IndexError, TypeError):
                if model_name != fallback_model:
                    continue
                raise RuntimeError(f"Unexpected Gemini response format: {data}")

        raise RuntimeError("Gemini API request failed for all configured models.")
