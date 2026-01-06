

export async function fetchWhatsappRealtimeToken() {
    const res = await fetch("/api/realtime/whatsapp");
    const data = await res.json();
    return data.token;
}