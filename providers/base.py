class BaseChatProvider:
    name = "base"

    def __init__(self, model_name: str, system_prompt: str):
        self.model_name = model_name
        self.system_prompt = system_prompt

    def is_enabled(self) -> bool:
        return False

    def generate(self, message: str) -> str:
        raise NotImplementedError
