import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-lg font-semibold">AlgoDatta</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Auto trading platform with DhanHQ + TradingView, built for speed and control.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link className="hover:underline" href="/strategies">Strategy Manager</Link></li>
              <li><Link className="hover:underline" href="/executions">Live Executions</Link></li>
              <li><Link className="hover:underline" href="/reports">Reports</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Integrations</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>DhanHQ</li>
              <li>TradingView</li>
              <li>Slack / Telegram / Discord</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Legal</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link className="hover:underline" href="/terms">Terms</Link></li>
              <li><Link className="hover:underline" href="/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-slate-500 dark:text-slate-500">© {new Date().getFullYear()} AlgoDatta. All rights reserved.</div>
      </div>
    </footer>
  );
}