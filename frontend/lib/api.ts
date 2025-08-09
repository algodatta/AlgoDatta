// Lightweight fetch wrapper; no axios dependency
    export function baseURL() {
      if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_BASE || '';
      return process.env.NEXT_PUBLIC_API_BASE || '';
    }

    export function authHeaders() {
      if (typeof window === 'undefined') return {};
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    }

    function toQuery(params: Record<string, any> | undefined) {
      if (!params) return '';
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => {
        if (v === undefined || v === null || v === '') return;
        sp.append(k, String(v));
      });
      const qs = sp.toString();
      return qs ? `?${qs}` : '';
    }

    async function request(method: string, url: string, data?: any, opts: { headers?: Record<string,string>, params?: Record<string,any> } = {}) {
      const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
      const qs = toQuery(opts.params);
      const res = await fetch(`${baseURL()}${url}${qs}`, {
        method,
        headers,
        body: ['GET','HEAD'].includes(method) ? undefined : (data ? JSON.stringify(data) : undefined)
      });
      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        // @ts-ignore
        err.response = { status: res.status, data: payload };
        throw err;
      }
      return { data: payload, status: res.status };
    }

    export const api = {
      get: (url: string, cfg?: { headers?: Record<string,string>, params?: Record<string,any> }) => request('GET', url, undefined, cfg),
      post: (url: string, data?: any, cfg?: { headers?: Record<string,string>, params?: Record<string,any> }) => request('POST', url, data, cfg),
      put: (url: string, data?: any, cfg?: { headers?: Record<string,string>, params?: Record<string,any> }) => request('PUT', url, data, cfg),
      patch: (url: string, data?: any, cfg?: { headers?: Record<string,string>, params?: Record<string,any> }) => request('PATCH', url, data, cfg),
      delete: (url: string, cfg?: { headers?: Record<string,string>, params?: Record<string,any> }) => request('DELETE', url, undefined, cfg),
    };
