// app/.../nodes/components/email/actions.ts


export async function fetchEmailRealtimeToken() {
    const res = await fetch("/api/realtime/email");
    const data = await res.json();
    return data.token;
}
