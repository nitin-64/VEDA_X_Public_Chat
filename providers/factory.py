import os

from .gemini_provider import GeminiChatProvider
from .openai_provider import OpenAIChatProvider


def read_env_secret(var_name: str, *fallback_names: str) -> str:
    candidates = (var_name, *fallback_names)
    for candidate in candidates:
        value = os.getenv(candidate)
        if value and value.strip():
            return value.strip()

        file_key = f"{candidate}_FILE"
        file_path = os.getenv(file_key)
        if not file_path:
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as handle:
                value = handle.read().strip()
        except OSError:
            continue

        if value:
            return value

    return ""


def build_provider_from_env(system_prompt: str = ""):
    provider_name = (read_env_secret("AI_PROVIDER", "LLM_PROVIDER") or "openai").lower()
    model_name = read_env_secret("OPENAI_MODEL") or "gpt-4o-mini"

    if provider_name in {"gemini", "google", "google_gemini"}:
        gemini_model = read_env_secret("GEMINI_MODEL") or "gemini-3.5-flash-lite"
        return GeminiChatProvider(
            api_key=read_env_secret("GEMINI_API_KEY"),
            model_name=gemini_model,
            system_prompt=system_prompt,
        )

    return OpenAIChatProvider(
        api_key=read_env_secret("OPENAI_API_KEY"),
        model_name=model_name,
        system_prompt=system_prompt,
    )
