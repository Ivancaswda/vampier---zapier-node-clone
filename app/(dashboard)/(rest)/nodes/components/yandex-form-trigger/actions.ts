

export async function fetchYandexTriggerRealtimeToken() {
    const res = await fetch("/api/realtime/yandex");
    const data = await res.json();
    return data.token;
}