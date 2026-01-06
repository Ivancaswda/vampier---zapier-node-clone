

export async function fetchVkRealtimeToken() {
    const res = await fetch("/api/realtime/vk");
    const data = await res.json();
    return data.token;
}