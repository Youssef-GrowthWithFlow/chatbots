const API_BASE_URL = "http://localhost:8000";

export async function sendMessage(message, flowId = "PRESENTATION", onChunk) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, flow_id: flowId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);

        if (data === "[DONE]") {
          return fullText;
        }

        if (data.trim()) {
          fullText += data;
          if (onChunk) {
            onChunk(data);
          }
        }
      }
    }
  }

  return fullText;
}
