/**
 * Supabase Edge Function: publish-posts
 *
 * 排程自動發佈函式 — 由 pg_cron 每分鐘觸發一次。
 * 查詢所有「已到排程時間但尚未發佈」的貼文，將其狀態更新為 published，
 * 並（未來）呼叫各平台的發佈 API。
 *
 * 環境變數（Supabase 自動注入，無需手動設定）：
 *   SUPABASE_URL              — 專案 API URL
 *   SUPABASE_SERVICE_ROLE_KEY — 具完整權限的 Service Role Key（繞過 RLS）
 *
 * 未來需要另外在 Secrets 設定的 Key：
 *   FB_PAGE_ACCESS_TOKEN      — Facebook Page Access Token
 *   LINE_CHANNEL_ACCESS_TOKEN — LINE Messaging API Channel Access Token
 *   THREADS_ACCESS_TOKEN      — Threads API Access Token
 *   IG_ACCESS_TOKEN           — Instagram Graph API Access Token
 *   IG_USER_ID                — Instagram 商業帳號 User ID
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ─── CORS（pg_cron 直接呼叫不需要，但保留以便手動測試）────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── 型別定義 ─────────────────────────────────────────────────────────────────
interface Post {
  id: string;
  platform: 'facebook' | 'instagram' | 'threads' | 'line';
  content: string;
  scheduled_time: string;
  status: string;
  created_at: string;
}

// ─── 各平台發佈函式（目前為模擬，未來在此串接真實 API）────────────────────────

/**
 * [TODO] Facebook 發佈
 * 使用 Meta Graph API：POST /{page-id}/feed
 * 需要：FB_PAGE_ACCESS_TOKEN
 * 文件：https://developers.facebook.com/docs/pages/publishing
 */
async function publishToFacebook(post: Post): Promise<void> {
  console.log(`[Facebook] 模擬發佈貼文 id=${post.id}`);
  // const pageId = Deno.env.get('FB_PAGE_ID')!;
  // const token  = Deno.env.get('FB_PAGE_ACCESS_TOKEN')!;
  // await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message: post.content, access_token: token }),
  // });
}

/**
 * [TODO] Instagram 發佈
 * 使用 Meta Content Publishing API（需先上傳媒體容器）：
 *   1. POST /{ig-user-id}/media         → 建立容器，取得 creation_id
 *   2. POST /{ig-user-id}/media_publish → 正式發佈
 * 需要：IG_ACCESS_TOKEN、IG_USER_ID
 * 文件：https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 */
async function publishToInstagram(post: Post): Promise<void> {
  console.log(`[Instagram] 模擬發佈貼文 id=${post.id}`);
  // const userId = Deno.env.get('IG_USER_ID')!;
  // const token  = Deno.env.get('IG_ACCESS_TOKEN')!;
  // // Step 1: 建立媒體容器（純文字需搭配圖片，此處略）
  // // Step 2: 發佈
}

/**
 * [TODO] Threads 發佈
 * 使用 Threads API（Meta，2024 年開放）：
 *   1. POST /{user-id}/threads         → 建立草稿
 *   2. POST /{user-id}/threads_publish → 發佈
 * 需要：THREADS_ACCESS_TOKEN
 * 文件：https://developers.facebook.com/docs/threads
 */
async function publishToThreads(post: Post): Promise<void> {
  console.log(`[Threads] 模擬發佈貼文 id=${post.id}`);
  // const userId = Deno.env.get('THREADS_USER_ID')!;
  // const token  = Deno.env.get('THREADS_ACCESS_TOKEN')!;
  // const res = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ media_type: 'TEXT', text: post.content, access_token: token }),
  // });
  // const { id: creationId } = await res.json();
  // await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ creation_id: creationId, access_token: token }),
  // });
}

/**
 * [TODO] LINE 官方帳號發佈（Broadcast 廣播訊息）
 * 使用 LINE Messaging API：POST /v2/bot/message/broadcast
 * 需要：LINE_CHANNEL_ACCESS_TOKEN
 * 文件：https://developers.line.biz/en/docs/messaging-api/broadcasting-messages/
 */
async function publishToLine(post: Post): Promise<void> {
  console.log(`[LINE] 模擬發佈貼文 id=${post.id}`);
  // const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')!;
  // await fetch('https://api.line.me/v2/bot/message/broadcast', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`,
  //   },
  //   body: JSON.stringify({
  //     messages: [{ type: 'text', text: post.content }],
  //   }),
  // });
}

// ─── 主要處理器 ───────────────────────────────────────────────────────────────
Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight（手動測試用）
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // ── 初始化 Supabase（使用 service_role 繞過 RLS）──────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 未設定');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ── 取得目前 UTC 時間 ──────────────────────────────────────────────────────
    const nowUtc = new Date().toISOString();
    console.log(`[publish-posts] 執行時間 (UTC): ${nowUtc}`);

    // ── 查詢待發佈的貼文 ───────────────────────────────────────────────────────
    // 條件：status = 'pending' 且 scheduled_time <= 現在時間
    const { data: pendingPosts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', nowUtc);

    if (fetchError) {
      throw new Error(`查詢待發佈貼文失敗：${fetchError.message}`);
    }

    // ── 沒有需要發佈的貼文 ─────────────────────────────────────────────────────
    if (!pendingPosts || pendingPosts.length === 0) {
      console.log('[publish-posts] 目前沒有待發佈的貼文。');
      return new Response(
        JSON.stringify({ message: '目前沒有待發佈的貼文', published: 0 }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`[publish-posts] 找到 ${pendingPosts.length} 則待發佈貼文。`);

    // ── 逐一呼叫各平台發佈函式 ─────────────────────────────────────────────────
    const results: { id: string; platform: string; success: boolean; error?: string }[] = [];

    for (const post of pendingPosts as Post[]) {
      try {
        switch (post.platform) {
          case 'facebook':
            await publishToFacebook(post);
            break;
          case 'instagram':
            await publishToInstagram(post);
            break;
          case 'threads':
            await publishToThreads(post);
            break;
          case 'line':
            await publishToLine(post);
            break;
          default:
            console.warn(`[publish-posts] 未知平台：${post.platform}`);
        }
        results.push({ id: post.id, platform: post.platform, success: true });
      } catch (platformErr) {
        // 單一平台失敗不中斷整體流程，記錄錯誤後繼續
        const errMsg = platformErr instanceof Error ? platformErr.message : String(platformErr);
        console.error(`[publish-posts] 平台 ${post.platform} 發佈失敗：${errMsg}`);
        results.push({ id: post.id, platform: post.platform, success: false, error: errMsg });
      }
    }

    // ── 將「成功發佈」的貼文狀態更新為 published ───────────────────────────────
    const successIds = results.filter((r) => r.success).map((r) => r.id);

    if (successIds.length > 0) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ status: 'published' })
        .in('id', successIds);

      if (updateError) {
        throw new Error(`更新發佈狀態失敗：${updateError.message}`);
      }
      console.log(`[publish-posts] 已將 ${successIds.length} 則貼文標記為 published。`);
    }

    // ── 回傳執行摘要 ───────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        message: `發佈完成：成功 ${successIds.length} 則，失敗 ${results.length - successIds.length} 則`,
        published: successIds.length,
        failed: results.length - successIds.length,
        results,
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[publish-posts] 執行錯誤：${message}`);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }
});
