
export async function fetchManualTriggerRealtimeToken() {
    const res = await fetch("/api/realtime/manual-trigger");
    const data = await res.json();
    return data.token;
}