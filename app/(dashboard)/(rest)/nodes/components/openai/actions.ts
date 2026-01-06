
export async function fetchOpenaiRealtimeToken() {
    const res = await fetch("/api/realtime/openai");
    const data = await res.json();
    return data.token;
}