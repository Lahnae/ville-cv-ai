const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

function appendMessageText(element, text) {
    const normalized = String(text)
        .replace(/\\\*\s*\\\*/g, "**")
        .replace(/\\\*/g, "*");
    const boldPattern = /\*\*(.+?)\*\*/gs;
    let lastIndex = 0;

    for (const match of normalized.matchAll(boldPattern)) {
        element.appendChild(document.createTextNode(normalized.slice(lastIndex, match.index)));
        const strong = document.createElement("strong");
        strong.textContent = match[1];
        element.appendChild(strong);
        lastIndex = match.index + match[0].length;
    }

    element.appendChild(document.createTextNode(normalized.slice(lastIndex)));
}

function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("chat-message", sender === "user" ? "chat-user" : "chat-ai");

    if (sender === "ai") {
        appendMessageText(msg, text);
    } else {
        msg.textContent = text;
    }

    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateStatus(online, model = null) {
    let status = document.getElementById("ai-status");
    if (!status) {
        status = document.createElement("div");
        status.id = "ai-status";
        status.classList.add("ai-status");
        status.setAttribute("role", "status");
        chatWindow.parentElement.insertBefore(status, chatWindow);
    }

    if (online) {
        status.textContent = model ? `AI-palvelu käytettävissä – ${model}` : "AI-palvelu käytettävissä";
        status.classList.remove("offline");
        status.classList.add("online");
    } else {
        status.textContent = "AI-palvelu ei ole tällä hetkellä käytettävissä";
        status.classList.remove("online");
        status.classList.add("offline");
    }
}

async function checkAIStatus() {
    try {
        const response = await fetch("/api/status", { method: "GET", cache: "no-store" });
        if (!response.ok) throw new Error("Status request failed");
        const data = await response.json();
        updateStatus(data.online === true, data.model);
    } catch (error) {
        updateStatus(false);
        console.error("AI status check failed:", error);
    }
}

async function sendMessage(event) {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text || chatSend.disabled) return;

    addMessage(text, "user");
    chatInput.value = "";
    chatSend.disabled = true;
    chatSend.textContent = "Lähetetään…";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "AI service unavailable");
        addMessage(data.reply, "ai");
    } catch (error) {
        addMessage("AI-palvelu ei ole tällä hetkellä käytettävissä. Yritä myöhemmin uudelleen.", "ai");
        console.error(error);
    } finally {
        chatSend.disabled = false;
        chatSend.textContent = "Lähetä";
        chatInput.focus();
    }
}

if (chatForm && chatWindow && chatInput && chatSend) {
    chatForm.addEventListener("submit", sendMessage);
    checkAIStatus();
}
