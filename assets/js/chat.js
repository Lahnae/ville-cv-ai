const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("chat-message");

    if (sender === "user") {
        msg.classList.add("chat-user");
    } else {
        msg.classList.add("chat-ai");
    }

    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateStatus(online, model = null) {
    let status = document.getElementById("ai-status");

    if (!status) {
        status = document.createElement("div");
        status.id = "ai-status";
        status.classList.add("ai-status");
        chatWindow.parentElement.insertBefore(status, chatWindow);
    }

    if (online) {
        status.textContent = model
            ? `🟢 AI-palvelu käytettävissä – ${model}`
            : "🟢 AI-palvelu käytettävissä";

        status.classList.remove("offline");
        status.classList.add("online");
    } else {
        status.textContent = "🔴 AI-palvelu ei ole tällä hetkellä käytettävissä";

        status.classList.remove("online");
        status.classList.add("offline");
    }
}

async function checkAIStatus() {
    try {
        const response = await fetch("/api/status", {
            method: "GET",
            cache: "no-store"
        });

        const data = await response.json();

        updateStatus(data.online === true, data.model);
    } catch (error) {
        updateStatus(false);
        console.error("AI status check failed:", error);
    }
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatInput.value = "";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI service unavailable");
        }

        addMessage(data.reply, "ai");

    } catch (error) {
        addMessage(
            "🔴 AI-palvelu ei ole tällä hetkellä käytettävissä. Yritä myöhemmin uudelleen.",
            "ai"
        );

        console.error(error);
    }
}

chatSend.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

checkAIStatus();
