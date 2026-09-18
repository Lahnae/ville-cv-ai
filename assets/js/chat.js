// Elements
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// Add message to UI
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

    // Auto-scroll
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send message to backend
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Show user message
    addMessage(text, "user");
    chatInput.value = "";

    // Call Azure Function
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        // Show AI response
        addMessage(data.reply, "ai");

    } catch (error) {
        addMessage("Virhe: palvelimeen ei saatu yhteyttä.", "ai");
        console.error(error);
    }
}

// Send on button click
chatSend.addEventListener("click", sendMessage);

// Send on Enter key
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});
