set -euo pipefail

echo "1) Ensure '@/…' alias works in frontend/tsconfig.json"
if [ -f frontend/tsconfig.json ]; then
  node - <<'NODE'
  const fs=require('fs'); const p='frontend/tsconfig.json';
  const j=JSON.parse(fs.readFileSync(p,'utf8'));
  j.compilerOptions=j.compilerOptions||{};
  if(!j.compilerOptions.baseUrl) j.compilerOptions.baseUrl='.';
  j.compilerOptions.paths = { '@/*': ['./*'], ...(j.compilerOptions.paths||{}) };
  fs.writeFileSync(p, JSON.stringify(j,null,2) + "\n");
NODE
fi

echo "2) Normalize every lib/api import to '@/lib/api'"
# Handles ../lib/api, ../../lib/api, ../../../lib/api, etc.
find frontend -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 \
 | xargs -0 sed -i -E \
   -e "s#from ['\"](\\.\\./)+lib/api['\"]#from '@/lib/api'#g" \
   -e "s#require\\(['\"](\\.\\./)+lib/api['\"]\\)#require('@/lib/api')#g"

echo "3) Fix apiBase() (function call) -> apiBase (string)"
grep -RIl "apiBase\\(\\)" frontend | xargs -r sed -i -E 's/apiBase\(\)/apiBase/g'

echo "4) Ensure a canonical frontend/lib/api.ts with all expected exports"
mkdir -p frontend/lib
cat > frontend/lib/api.ts <<'TS'
export const apiBase: string =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem('token') || ''; } catch { return ''; }
}

export function authHeaders(): Record<string,string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** Parse JSON + throw typed error details when available */
export async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as any)?.detail ?? (data as any)?.message ?? res.statusText;
    throw new Error(typeof detail === 'string' ? detail : 'Request failed');
  }
  return data as T;
}

/** Low-level helper when you need the raw Response */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${apiBase}${path}`, init);
}
TS

echo "5) Report remaining offenders (ideally none)"
echo "   - residual relative lib/api imports:"
grep -RIn "from ['\"][.][.]/+lib/api" frontend || true
grep -RIn "from ['\"][.][.]/[.][.]/+lib/api" frontend || true
echo "   - residual apiBase() call sites:"
grep -RIn "apiBase\\(\\)" frontend || true

echo "Done."
