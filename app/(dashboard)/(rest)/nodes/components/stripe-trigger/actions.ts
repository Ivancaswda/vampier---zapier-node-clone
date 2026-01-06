

export async function fetchStripeRealtimeToken() {
    const res = await fetch("/api/realtime/stripe");
    const data = await res.json();
    return data.token;
}