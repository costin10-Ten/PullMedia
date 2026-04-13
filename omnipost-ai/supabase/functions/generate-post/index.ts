// Supabase Edge Function: generate-post
// Calls Google Gemini API to generate social-media copy for 4 platforms.
// Deployed via: supabase functions deploy generate-post
// Secret needed: supabase secrets set GEMINI_API_KEY=<your-key>

const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview'; // https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-preview
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ─── CORS headers (allow Vite dev server + any production origin) ─────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `你是一位專業的社群媒體行銷專家，擅長為不同平台撰寫引人入勝的貼文。
請根據使用者提供的草稿或長篇文章，為以下四個社群平台各自生成一篇最適合的貼文文案：

• Facebook（fb）：100–300 字，語氣親切有溫度，可使用表情符號，結尾鼓勵互動（留言、分享、按讚）。
• Instagram（ig）：150 字以內，視覺感強、簡潔有力，結尾附上 5–10 個精準 Hashtag（#）。
• Threads（threads）：500 字以內，對話感強，可提問或引發討論，語氣輕鬆自然。
• LINE 官方帳號（line）：口語親切，適合推播通知，帶有明確的行動呼籲（Call to Action）。

【重要】請嚴格只回傳以下 JSON 格式，不得包含任何 Markdown、程式碼區塊或其他說明文字：
{
  "fb": "Facebook 文案",
  "ig": "Instagram 文案",
  "threads": "Threads 文案",
  "line": "LINE 文案"
}`;

// ─── JSON extraction helper ───────────────────────────────────────────────────
function extractJson(text: string): Record<string, string> {
  // First try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown code fences and try again
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      return JSON.parse(fenceMatch[1]);
    }
    // Last resort: extract first {...} block
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      return JSON.parse(braceMatch[0]);
    }
    throw new Error('Cannot parse Gemini response as JSON');
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ── Parse body ────────────────────────────────────────────────────────────
    let body: { draftText?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const draftText = body?.draftText?.trim();
    if (!draftText) {
      return new Response(
        JSON.stringify({ error: '`draftText` is required and must not be empty' }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // ── Read API key ──────────────────────────────────────────────────────────
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: GEMINI_API_KEY not set' }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // ── Call Gemini ───────────────────────────────────────────────────────────
    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: draftText }],
          },
        ],
        generationConfig: {
          // Ask Gemini to return strict JSON
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error ${geminiRes.status}: ${errBody}` }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    const geminiData = await geminiRes.json();
    const rawText: string | undefined =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'Empty or unexpected response from Gemini', raw: geminiData }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // ── Parse & validate result ───────────────────────────────────────────────
    const parsed = extractJson(rawText);

    // Ensure all four keys are present
    const required = ['fb', 'ig', 'threads', 'line'];
    const missing = required.filter((k) => !parsed[k]);
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Gemini response missing keys: ${missing.join(', ')}`, raw: parsed }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // ── Return ────────────────────────────────────────────────────────────────
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
