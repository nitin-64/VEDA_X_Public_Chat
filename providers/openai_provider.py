from typing import Optional

from openai import OpenAI

from .base import BaseChatProvider


class OpenAIChatProvider(BaseChatProvider):
    name = "openai"

    def __init__(self, api_key: Optional[str], model_name: str, system_prompt: str):
        super().__init__(model_name=model_name, system_prompt=system_prompt)
        self.client = OpenAI(api_key=api_key) if api_key else None

    def is_enabled(self) -> bool:
        return self.client is not None

    def generate(self, message: str) -> str:
        if not self.client:
            raise ValueError("OpenAI API key is not configured")

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": message},
            ],
            temperature=0.3,
            max_tokens=800,
        )

        text = response.choices[0].message.content
        if text is None:
            return "I’m unable to generate a response right now."
        return text.strip() or "I’m unable to generate a response right now."
