
export async function fetchGoogleTriggerRealtimeToken() {
    const res = await fetch("/api/realtime/google");
    const data = await res.json();
    return data.token;
}