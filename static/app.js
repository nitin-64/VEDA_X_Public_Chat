const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInlineMarkdown(text) {
  let html = escapeHtml(text);

  if (window.katex) {
    const mathPatterns = [
      { regex: /\$\$([\s\S]+?)\$\$/g, mode: "display" },
      { regex: /\\\[([\s\S]+?)\\\]/g, mode: "display" },
      { regex: /\$([^\n$]+?)\$/g, mode: "inline" },
      { regex: /\\\((.+?)\\\)/g, mode: "inline" }
    ];

    mathPatterns.forEach(({ regex, mode }) => {
      html = html.replace(regex, (match, expr) => {
        try {
          return window.katex.renderToString(expr.trim(), {
            throwOnError: false,
            displayMode: mode === "display",
            output: "htmlAndMathml"
          });
        } catch (error) {
          return escapeHtml(match);
        }
      });
    });
  }

  html = html
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(\*\*|__)(.+?)\1/g, "<strong>$2</strong>")
    .replace(/(\*|_)(?!\s)(.+?)(?<!\s)\1/g, "<em>$2</em>");

  return html;
}

function renderMarkdown(text) {
  const rawLines = (text || "").split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${formatInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  rawLines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^[-*+]\s+/, ""));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^\d+\.\s+/, ""));
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return html.join("");
}

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "U" : "V";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = renderMarkdown(text);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function addTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "V";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing";
  bubble.innerHTML = "<span></span><span></span><span></span>";

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;

  return wrapper;
}

function streamAssistantResponse(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "V";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;

  const fullText = text || "";
  let index = 0;

  const tick = () => {
    if (index >= fullText.length) {
      bubble.innerHTML = renderMarkdown(fullText);
      messages.scrollTop = messages.scrollHeight;
      return;
    }

    const nextIndex = Math.min(index + 3, fullText.length);
    index = nextIndex;
    const currentText = fullText.slice(0, index);

    bubble.innerHTML = renderMarkdown(currentText);
    messages.scrollTop = messages.scrollHeight;

    if (index < fullText.length) {
      setTimeout(tick, 10);
    }
  };

  setTimeout(tick, 10);
  return wrapper;
}

async function sendChatMessage(text, options = {}) {
  const { silent = false } = options;
  const cleanText = text.trim();
  if (!cleanText) return;

  if (!silent) {
    addMessage("user", cleanText);
    input.value = "";
  }

  const typing = addTypingIndicator();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: cleanText })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    typing.remove();
    streamAssistantResponse(data.response || "No answer returned.");
  } catch (error) {
    typing.remove();
    addMessage("assistant", "Something went wrong. Please check the backend configuration.");
    console.error(error);
  }
}

let startupPromptTriggered = false;

function triggerStartupPrompt() {
  if (startupPromptTriggered || !messages || !input) return;
  startupPromptTriggered = true;

  setTimeout(() => {
    sendChatMessage("veda_start", { silent: true });
  }, 200);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  await sendChatMessage(text);
});

if (document.readyState === "complete") {
  triggerStartupPrompt();
} else {
  window.addEventListener("load", triggerStartupPrompt);
}

input.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 180) + "px";
});
