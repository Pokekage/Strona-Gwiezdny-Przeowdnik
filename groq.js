// Netlify Function: proxy do Groq API z zabezpieczeniami.
// Klucz GROQ_API_KEY jest tylko w zmiennych środowiskowych Netlify — nigdy w kodzie.
// Zabezpieczenia: blokada wywołań z obcych stron (Origin), lista dozwolonych modeli,
// limit tokenów, limit długości zapytania i whitelist pól przekazywanych do Groq.

const ALLOWED_ORIGINS = [
    'https://gwiezdnyprzewodnik.pl',
    'https://www.gwiezdnyprzewodnik.pl',
    // Dodatkowe adresy (np. podgląd na *.netlify.app) — zmienna środowiskowa w Netlify,
    // kilka adresów oddzielonych przecinkami: EXTRA_ALLOWED_ORIGINS=https://xyz.netlify.app
    ...(process.env.EXTRA_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
];
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/; // netlify dev / Live Server

const ALLOWED_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS_LIMIT = 1500;   // strona wysyła 1200
const MAX_MESSAGES = 10;
const MAX_TOTAL_CHARS = 8000;    // suma znaków we wszystkich wiadomościach
const ALLOWED_ROLES = ['system', 'user', 'assistant'];

const json = (status, obj) => new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
});
const error = (status, message) => json(status, { error: { message } });
const clamp = (value, min, max, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};

export default async (req) => {
    if (req.method !== 'POST') return error(405, 'Method not allowed');

    // Przeglądarki wysyłają Origin przy każdym POST, więc obce strony są blokowane.
    // Brak nagłówka (np. aplikacja mobilna, curl) przepuszczamy — wtedy chronią limity poniżej.
    const origin = req.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin) && !LOCAL_ORIGIN.test(origin)) {
        return error(403, 'Forbidden origin');
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return error(400, 'Nieprawidłowy JSON');
    }

    const messages = Array.isArray(body?.messages) ? body.messages : null;
    if (!messages || messages.length === 0 || messages.length > MAX_MESSAGES) {
        return error(400, 'Nieprawidłowa lista wiadomości');
    }

    let totalChars = 0;
    for (const m of messages) {
        if (!m || !ALLOWED_ROLES.includes(m.role) || typeof m.content !== 'string') {
            return error(400, 'Nieprawidłowa wiadomość');
        }
        totalChars += m.content.length;
    }
    if (totalChars > MAX_TOTAL_CHARS) return error(413, 'Zapytanie jest za długie');

    // Zapytanie do Groq budujemy sami — z body klienta bierzemy tylko bezpieczne pola
    const payload = {
        model: ALLOWED_MODELS.includes(body.model) ? body.model : DEFAULT_MODEL,
        messages: messages.map(({ role, content }) => ({ role, content })),
        max_tokens: Math.round(clamp(body.max_tokens, 1, MAX_TOKENS_LIMIT, 1200)),
        temperature: clamp(body.temperature, 0, 1.5, 0.8),
    };
    if (body.response_format?.type === 'json_object') {
        payload.response_format = { type: 'json_object' };
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        return json(response.status, data);
    } catch {
        return error(502, 'Brak połączenia z Groq');
    }
};

export const config = { path: '/api/groq' };
