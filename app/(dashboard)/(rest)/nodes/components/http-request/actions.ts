

export async function fetchHttpRequestRealtimeToken() {
    const res = await fetch("/api/realtime/http-request");
    const data = await res.json();
    return data.token;
}