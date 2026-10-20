import os
import tempfile
import unittest

from veda_x_public_chat.providers.factory import read_env_secret


class SecretFileSupportTests(unittest.TestCase):
    def test_read_env_secret_prefers_secret_file(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            secret_file = os.path.join(tmp_dir, "gemini_api_key.txt")
            with open(secret_file, "w", encoding="utf-8") as fp:
                fp.write("file-backed-key\n")

            os.environ.pop("GEMINI_API_KEY", None)
            os.environ["GEMINI_API_KEY_FILE"] = secret_file

            try:
                self.assertEqual(read_env_secret("GEMINI_API_KEY"), "file-backed-key")
            finally:
                os.environ.pop("GEMINI_API_KEY_FILE", None)


if __name__ == "__main__":
    unittest.main()
