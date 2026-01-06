
export async function fetchDiscordRealtimeToken() {
    const res = await fetch("/api/realtime/discord");
    const data = await res.json();
    return data.token;
}