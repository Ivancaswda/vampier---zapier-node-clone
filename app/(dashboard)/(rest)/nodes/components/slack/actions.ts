

export async function fetchSlackRealtimeToken() {
    const res = await fetch("/api/realtime/slack");
    const data = await res.json();
    return data.token;
}