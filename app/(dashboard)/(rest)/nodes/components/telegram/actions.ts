

export async function fetchTelegramRealtimeToken() {
    const res = await fetch("/api/realtime/telegram");
    const data = await res.json();
    return data.token;
}