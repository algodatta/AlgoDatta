export const dynamic = 'force-static';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        {/* HERO */}
        <section className="py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Auto-trade smarter with <span className="text-blue-600">DhanHQ</span> + TradingView
              </h1>
              <p className="mt-6 text-slate-600 dark:text-slate-300 text-lg md:text-xl">
                Strategy Manager, live Executions, risk toggles, and rich alerts — all in one polished web app.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/strategies" className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700">
                  Explore Strategies
                </a>
                <a href="/broker" className="rounded-xl border px-6 py-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-700">
                  Connect Broker
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-medium">Live Execution Preview</div>
                  <div className="text-xs text-slate-500">demo</div>
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <div className="rounded-lg bg-slate-900 px-3 py-2 text-slate-100">[OK] Webhook: Signal BUY NATURALGAS</div>
                  <div className="rounded-lg bg-slate-900 px-3 py-2 text-slate-100">[OK] Risk Check: qty=1 sl=0.5%</div>
                  <div className="rounded-lg bg-slate-900 px-3 py-2 text-slate-100">[OK] PaperEngine: ORDER_PLACED #124</div>
                  <div className="rounded-lg bg-slate-900 px-3 py-2 text-slate-100">[OK] Notifier: Slack + Telegram sent</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}