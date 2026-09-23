module.exports = async function (context, req) {
    context.log("AI status request received");

    context.res = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };

    if (req.method === "OPTIONS") {
        context.res.status = 200;
        return;
    }

    const proxyUrl = process.env.OLLAMA_PROXY_URL;
    const proxyApiKey = process.env.OLLAMA_PROXY_API_KEY;

    if (!proxyUrl || !proxyApiKey) {
        context.res.status = 500;
        context.res.body = {
            online: false
        };
        return;
    }

    try {
        const response = await fetch(`${proxyUrl}/health`, {
            method: "GET",
            headers: {
                "X-API-Key": proxyApiKey
            }
        });

        const data = await response.json();

        context.res.status = response.ok ? 200 : 503;
        context.res.body = {
            online: data.online === true,
            model: data.model || null
        };

    } catch (error) {
        context.log("AI status error:", error);

        context.res.status = 503;
        context.res.body = {
            online: false
        };
    }
};
