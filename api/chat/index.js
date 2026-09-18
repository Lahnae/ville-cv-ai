const fetch = require("node-fetch");

module.exports = async function (context, req) {
    context.log("AI-chat request received");

    // CORS
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };

    if (req.method === "OPTIONS") {
        context.res.status = 200;
        return;
    }

    const userMessage = req.body?.message;

    if (!userMessage) {
        context.res.status = 400;
        context.res.body = { error: "Message missing" };
        return;
    }

    try {
        // Ollama endpoint (YOUR Nitro machine)
        const ollamaResponse = await fetch("http://192.168.1.132:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "villebot",
                prompt: userMessage
            })
        });

        const data = await ollamaResponse.json();

        context.res.status = 200;
        context.res.body = {
            reply: data.response
        };

    } catch (error) {
        context.log("Error:", error);

        context.res.status = 500;
        context.res.body = {
            error: "Ollama connection failed",
            details: error.message
        };
    }
};

