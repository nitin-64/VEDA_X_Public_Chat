import os

from .gemini_provider import GeminiChatProvider
from .openai_provider import OpenAIChatProvider


def build_provider_from_env(system_prompt: str = ""):
    provider_name = (os.getenv("AI_PROVIDER") or os.getenv("LLM_PROVIDER") or "openai").lower()
    model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if provider_name in {"gemini", "google", "google_gemini"}:
        gemini_model = os.getenv("GEMINI_MODEL") or "gemini-3.5-flash-lite"
        return GeminiChatProvider(
            api_key=os.getenv("GEMINI_API_KEY"),
            model_name=gemini_model,
            system_prompt=system_prompt,
        )

    return OpenAIChatProvider(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name=model_name,
        system_prompt=system_prompt,
    )
