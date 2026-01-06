
export async function fetchAnthropicRealtimeToken() {
    const res = await fetch("/api/realtime/anthropic");
    const data = await res.json();
    return data.token;
}