

export async function fetchGeminiRealtimeToken() {
    const res = await fetch("/api/realtime/gemini");
    const data = await res.json();
    return data.token;
}