import { useState } from 'react';
import {
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Facebook,
  Instagram,
  MessageCircle,
  MessageSquare,
  Send,
  Trash2,
  ChevronRight,
} from 'lucide-react';

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    colorClass: 'bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
    ringColor: 'focus:ring-blue-400',
    bgLight: 'bg-blue-50',
    activeBorder: 'border-b-blue-600',
    placeholder:
      '在 Facebook 上分享您的想法... (建議 100–300 字，可加入表情符號 🎉)',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    colorClass: 'bg-pink-500',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-500',
    ringColor: 'focus:ring-pink-400',
    bgLight: 'bg-pink-50',
    activeBorder: 'border-b-pink-500',
    placeholder:
      '撰寫 Instagram 說明文字... (善用 Hashtag #品牌 #行銷，建議 150 字以內)',
  },
  {
    id: 'threads',
    label: 'Threads',
    icon: MessageCircle,
    colorClass: 'bg-gray-900',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-700',
    ringColor: 'focus:ring-gray-400',
    bgLight: 'bg-gray-50',
    activeBorder: 'border-b-gray-800',
    placeholder: 'Threads 貼文... (建議簡短有力，500 字以內)',
  },
  {
    id: 'line',
    label: 'LINE',
    icon: MessageSquare,
    colorClass: 'bg-green-500',
    textColor: 'text-green-600',
    borderColor: 'border-green-500',
    ringColor: 'focus:ring-green-400',
    bgLight: 'bg-green-50',
    activeBorder: 'border-b-green-500',
    placeholder:
      'LINE 官方帳號訊息... (親切口語風格，可搭配 LINE 貼圖說明)',
  },
];

// ─── Fake AI-generated content ────────────────────────────────────────────────
const generateFakeContent = (article) => {
  const preview = article.trim().slice(0, 40);
  return {
    facebook: `🌟 【精彩分享】\n\n${preview}...\n\n這是一篇值得細讀的好文！歡迎留言分享您的看法，別忘了按讚 👍 並分享給朋友！\n\n#內容行銷 #品牌故事 #分享`,
    instagram: `✨ ${preview}...\n\n點擊個人頁連結閱讀全文 🔗\n\n#品牌 #行銷 #內容創作 #社群媒體 #數位行銷 #創業 #台灣 #分享`,
    threads: `剛讀到一篇很有啟發的文章 🧵\n\n「${preview}...」\n\n你有什麼看法？留言告訴我 👇`,
    line: `嗨！今天想和大家分享一個有趣的內容 😊\n\n📌 ${preview}...\n\n完整內容請點擊下方連結，喜歡的話記得分享給朋友！\n\n🔗 查看全文`,
  };
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 size={11} />
        已發佈
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <Clock3 size={11} />
      等待發佈
    </span>
  );
}

// ─── Platform badge ───────────────────────────────────────────────────────────
function PlatformBadge({ platformId }) {
  const p = PLATFORMS.find((x) => x.id === platformId);
  if (!p) return null;
  const Icon = p.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${p.colorClass}`}
    >
      <Icon size={11} />
      {p.label}
    </span>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [article, setArticle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [contents, setContents] = useState({
    facebook: '',
    instagram: '',
    threads: '',
    line: '',
  });
  const [schedules, setSchedules] = useState({
    facebook: '',
    instagram: '',
    threads: '',
    line: '',
  });
  const [activeTab, setActiveTab] = useState('facebook');
  const [posts, setPosts] = useState([
    {
      id: 1,
      platform: 'facebook',
      content:
        '🌟 【品牌故事】我們從一個小車庫起步，憑著對品質的堅持打造出今天的產品線...',
      scheduledAt: '2026-04-15T09:00',
      status: 'published',
    },
    {
      id: 2,
      platform: 'instagram',
      content:
        '✨ 每一個成功的背後，都是無數次的嘗試與堅持 #品牌 #創業 #台灣',
      scheduledAt: '2026-04-16T12:00',
      status: 'pending',
    },
    {
      id: 3,
      platform: 'line',
      content:
        '嗨！今天有個好消息要告訴大家 😊 我們推出了全新的產品系列，快來看看！',
      scheduledAt: '2026-04-17T10:30',
      status: 'pending',
    },
  ]);

  // ── Generate (fake) ────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!article.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setContents(generateFakeContent(article));
      setGenerating(false);
    }, 1200);
  };

  // ── Add to schedule ────────────────────────────────────────────────────────
  const handleSchedule = () => {
    const newPosts = [];
    PLATFORMS.forEach(({ id }) => {
      if (contents[id] && schedules[id]) {
        newPosts.push({
          id: Date.now() + Math.random(),
          platform: id,
          content: contents[id],
          scheduledAt: schedules[id],
          status: 'pending',
        });
      }
    });
    if (newPosts.length === 0) return;
    setPosts((prev) => [...newPosts, ...prev]);
    setContents({ facebook: '', instagram: '', threads: '', line: '' });
    setSchedules({ facebook: '', instagram: '', threads: '', line: '' });
    setArticle('');
  };

  // ── Delete post ────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const activePlatform = PLATFORMS.find((p) => p.id === activeTab);
  const ActiveIcon = activePlatform.icon;
  const pendingCount = posts.filter((p) => p.status === 'pending').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const canSchedule = PLATFORMS.some(
    ({ id }) => contents[id] && schedules[id]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              OmniPost <span className="text-indigo-600">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden sm:inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
              <Clock3 size={11} />
              {pendingCount} 等待中
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
              <CheckCircle2 size={11} />
              {publishedCount} 已發佈
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        {/* Two-column on lg+ */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── LEFT: Article input ─────────────────────────────────────────── */}
          <section className="w-full lg:w-[42%] flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Sparkles size={14} className="text-indigo-600" />
                </div>
                <h2 className="font-semibold text-slate-700 text-sm">
                  原始文章
                </h2>
              </div>
              <textarea
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all min-h-[220px] lg:min-h-[320px]"
                placeholder={
                  '貼上或輸入您的原始長篇文章...\n\nAI 將自動為各平台生成最適合的貼文文案 ✨'
                }
                value={article}
                onChange={(e) => setArticle(e.target.value)}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {article.length} 字元
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={!article.trim() || generating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
                >
                  {generating ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      生成素材
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-indigo-600 mb-2">
                💡 使用步驟
              </p>
              <ol className="space-y-1.5 text-xs text-indigo-800/80">
                {[
                  '貼上您的長篇文章或新聞稿',
                  '點擊「生成素材」，AI 自動產生各平台文案',
                  '切換 Tab 調整文案並設定排程時間',
                  '點擊「確認並加入排程」完成設定',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ── RIGHT: Platform tabs ─────────────────────────────────────────── */}
          <section className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-slate-100 overflow-x-auto">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const isActive = activeTab === p.id;
                  const hasContent = !!contents[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveTab(p.id)}
                      className={`flex-1 min-w-[76px] flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold transition-all whitespace-nowrap border-b-2 ${
                        isActive
                          ? `${p.textColor} ${p.activeBorder} ${p.bgLight}`
                          : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden xs:inline sm:inline">
                        {p.label}
                      </span>
                      <span className="xs:hidden sm:hidden">{p.label}</span>
                      {hasContent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${activePlatform.colorClass}`}
                  >
                    <ActiveIcon size={13} />
                  </div>
                  <h2 className="font-semibold text-slate-700 text-sm">
                    {activePlatform.label} 文案
                  </h2>
                  {contents[activeTab] && (
                    <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      已生成
                    </span>
                  )}
                </div>
                <textarea
                  className={`w-full resize-none rounded-xl border p-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all min-h-[200px] lg:min-h-[260px] ${
                    contents[activeTab]
                      ? `${activePlatform.borderColor} bg-white ${activePlatform.ringColor}`
                      : `border-slate-200 bg-slate-50 ${activePlatform.ringColor}`
                  }`}
                  placeholder={activePlatform.placeholder}
                  value={contents[activeTab]}
                  onChange={(e) =>
                    setContents((prev) => ({
                      ...prev,
                      [activeTab]: e.target.value,
                    }))
                  }
                />
                <div className="mt-4 flex items-start gap-3">
                  <CalendarClock
                    size={15}
                    className="text-slate-400 shrink-0 mt-7"
                  />
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                      排程發佈時間
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                      value={schedules[activeTab]}
                      onChange={(e) =>
                        setSchedules((prev) => ({
                          ...prev,
                          [activeTab]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule button */}
            <button
              onClick={handleSchedule}
              disabled={!canSchedule}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-indigo-200 disabled:shadow-none active:scale-95"
            >
              <Send size={16} />
              確認並加入排程
            </button>
            {!canSchedule && (
              <p className="text-center text-xs text-slate-400 -mt-2 pb-1">
                請至少在一個平台填寫文案並設定排程時間
              </p>
            )}
          </section>
        </div>

        {/* ── Post list ───────────────────────────────────────────────────────── */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <CalendarClock size={18} className="text-indigo-500" />
              貼文排程列表
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                {pendingCount} 等待中
              </span>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                {publishedCount} 已發佈
              </span>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <CalendarClock size={44} className="mx-auto mb-3 opacity-25" />
              <p className="text-sm">尚無排程貼文，快來建立第一則吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {posts.map((post) => {
                const dt = post.scheduledAt
                  ? new Date(post.scheduledAt).toLocaleString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '未設定';
                return (
                  <div
                    key={post.id}
                    className={`bg-white rounded-2xl border p-4 flex flex-col gap-3 shadow-sm transition-shadow hover:shadow-md ${
                      post.status === 'published'
                        ? 'border-green-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <PlatformBadge platformId={post.platform} />
                        <StatusBadge status={post.status} />
                      </div>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-0.5 rounded"
                        title="刪除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-100 pt-2.5">
                      <CalendarClock size={12} />
                      {dt}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="mt-12 border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        OmniPost AI — 一鍵生成，跨平台排程發佈
      </footer>
    </div>
  );
}
