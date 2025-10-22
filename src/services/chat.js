﻿export async function sendMessageToBot(message) {
  try {
    const res = await fetch("/api/v1/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    console.log("Resposta do backend:", data);
    if (!data || !data.message) throw new Error("Resposta invalida do servidor");

    return data.message;
  } catch (err) {
    console.error("Erro no sendMessageToBot:", err);
    throw err;
  }
}
