module.exports = async function (context, req) {
    context.log("AI-chat request received");

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
        context.res.body = {
            error: "Message missing"
        };
        return;
    }

    const proxyUrl = process.env.OLLAMA_PROXY_URL;
    const proxyApiKey = process.env.OLLAMA_PROXY_API_KEY;

    if (!proxyUrl || !proxyApiKey) {
        context.log("Ollama proxy configuration is missing.");

        context.res.status = 500;
        context.res.body = {
            error: "Ollama proxy is not configured"
        };
        return;
    }

    try {
        const response = await fetch(`${proxyUrl}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": proxyApiKey
            },
            body: JSON.stringify({
                message: userMessage
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                `Ollama proxy returned HTTP ${response.status}`
            );
        }

        context.res.status = 200;
        context.res.body = {
            reply: data.reply
        };

    } catch (error) {
        context.log("Error:", error);

        context.res.status = 500;
        context.res.body = {
            error: "AI service unavailable"
        };
    }
};