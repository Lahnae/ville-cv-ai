const http = require("http");

const PORT = 3000;
const API_KEY = process.env.PROXY_API_KEY;

if (!API_KEY) {
    console.error("ERROR: PROXY_API_KEY is not set.");
    process.exit(1);
}

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Check API key
    if (req.headers["x-api-key"] !== API_KEY) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
    }

    // Health check
    if (req.method === "GET" && req.url === "/health") {
        try {
            const ollamaResponse = await fetch(
                "http://127.0.0.1:11434/api/tags"
            );

            if (!ollamaResponse.ok) {
                throw new Error("Ollama unavailable");
            }

            const ollamaData = await ollamaResponse.json();

            const modelAvailable = ollamaData.models?.some(
                model => model.name === "villebot" || model.name?.startsWith("villebot:")
            );

            if (!modelAvailable) {
                res.writeHead(503, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    online: false
                }));

                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                online: true,
                model: "villebot"
            }));

        } catch (error) {
            res.writeHead(503, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                online: false
            }));
        }

        return;
    }
    // Only POST /chat is allowed
    if (req.method !== "POST" || req.url !== "/chat") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
        return;
    }

    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", async () => {
        try {
            const data = JSON.parse(body);
            const message = data.message;

            if (!message) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Message missing" }));
                return;
            }

            const ollamaResponse = await fetch(
                "http://127.0.0.1:11434/api/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "villebot",
                        prompt: message,
                        stream: false
                    })
                }
            );

            if (!ollamaResponse.ok) {
                throw new Error(
                    `Ollama returned HTTP ${ollamaResponse.status}`
                );
            }

            const ollamaData = await ollamaResponse.json();

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                reply: ollamaData.response
            }));

        } catch (error) {
            console.error("Proxy error:", error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                error: "Ollama connection failed"
            }));
        }
    });
});

server.listen(PORT, "127.0.0.1", () => {
    console.log(`Ollama proxy listening on http://127.0.0.1:${PORT}`);
});
