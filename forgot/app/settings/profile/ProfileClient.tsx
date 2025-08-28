'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Field from '@/components/Field';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ToastProvider, useToast } from '@/components/toast/ToastContext';

type Profile = { id?: string; name?: string; email?: string; roles?: string[]; avatar_url?: string | null };
type Prefs = { time_zone?: string; marketing_emails?: boolean; product_updates?: boolean; security_alerts?: boolean };

const FALLBACK_TZS = ['UTC','Asia/Kolkata','Europe/London','America/New_York','America/Los_Angeles','Asia/Singapore','Asia/Tokyo','Australia/Sydney'];
function getTimeZones(): string[] {
  const anyIntl = Intl as any;
  if (anyIntl && typeof anyIntl.supportedValuesOf === 'function') {
    try { const list = anyIntl.supportedValuesOf('timeZone'); if (Array.isArray(list) && list.length > 0) return list as string[]; } catch {}
  }
  return FALLBACK_TZS;
}

function Inner({ next='/settings/profile' }: { next?: string }) {
  const { push } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [prefs, setPrefs] = useState<Prefs>({});
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const timeZones = useMemo(() => getTimeZones(), []);

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
        const res = await fetch(base + '/auth/me', { credentials: 'include', headers: { 'Accept': 'application/json' }, signal: abort.signal });
        if (res.status === 401) { window.location.href = '/login?next=' + encodeURIComponent(next || '/settings/profile'); return; }
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data);
        setName(data?.name || '');

        try {
          const pr = await fetch(base + '/auth/preferences', { credentials: 'include', headers: { 'Accept': 'application/json' }, signal: abort.signal });
          if (pr.status === 404) {
            setPrefs({ time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', marketing_emails: false, product_updates: true, security_alerts: true });
          } else if (pr.ok) {
            const p = await pr.json();
            setPrefs({ time_zone: p?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', marketing_emails: !!p?.marketing_emails, product_updates: !!p?.product_updates, security_alerts: p?.security_alerts !== false });
          } else setPrefsError('Failed to load preferences');
        } catch (e:any) {
          if (e.name !== 'AbortError') setPrefsError(e.message || 'Failed to load preferences');
        }
      } catch (e:any) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load profile');
      }
    }
    load();
    return () => abort.abort();
  }, [next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSaved(false); setSaving(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
      const res = await fetch(base + '/auth/me', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ name }) });
      if (res.status === 401) { window.location.href = '/login?next=' + encodeURIComponent(next || '/settings/profile'); return; }
      if (!res.ok) { const t = await res.text(); throw new Error(t || 'Update failed'); }
      setSaved(true);
      setProfile(p => ({ ...(p || {}), name }));
      push({ title: 'Profile updated', variant: 'success' });
    } catch (e:any) { setError(e.message || 'Update failed'); } finally { setSaving(false); }
  }

  async function onSavePrefs(e: React.FormEvent) {
    e.preventDefault();
    setPrefsError(null); setPrefsSaved(false); setPrefsSaving(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
      const res = await fetch(base + '/auth/preferences', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(prefs) });
      if (res.status === 401) { window.location.href = '/login?next=' + encodeURIComponent(next || '/settings/profile'); return; }
      if (!res.ok) { const t = await res.text(); throw new Error(t || 'Save failed'); }
      setPrefsSaved(true);
      push({ title: 'Preferences saved', variant: 'success' });
    } catch (e:any) { setPrefsError(e.message || 'Save failed'); } finally { setPrefsSaving(false); }
  }

  function onPickAvatar(file: File | null) {
    setAvatarError(null); setAvatarFile(null); setAvatarPreview(null);
    if (!file) return;
    const maxBytes = 2 * 1024 * 1024;
    if (!file.type.startsWith('image/')) { setAvatarError('Please choose an image file.'); return; }
    if (file.size > maxBytes) { setAvatarError('Max file size is 2MB.'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onUploadAvatar(e: React.FormEvent) {
    e.preventDefault();
    if (!avatarFile) return;
    setAvatarError(null); setAvatarSaving(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
      const form = new FormData();
      form.append('avatar', avatarFile);
      const r = await fetch(base + '/auth/me/avatar', { method: 'POST', credentials: 'include', body: form });
      if (r.status === 401) { window.location.href = '/login?next=' + encodeURIComponent(next || '/settings/profile'); return; }
      if (!r.ok) { const t = await r.text(); throw new Error(t || 'Upload failed'); }
      let url = null; try { const j = await r.json(); url = j?.avatar_url || null; } catch {}
      const newUrl = url || (profile?.avatar_url ? profile.avatar_url.split('?')[0] + `?t=${Date.now()}` : null);
      setProfile(p => ({ ...(p || {}), avatar_url: newUrl || null }));
      setAvatarFile(null); setAvatarPreview(null);
      push({ title: 'Avatar updated', variant: 'success' });
    } catch (e:any) { setAvatarError(e.message || 'Upload failed'); } finally { setAvatarSaving(false); }
  }

  async function onRemoveAvatar() {
    setConfirmRemove(false);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
      const r = await fetch(base + '/auth/me/avatar', { method: 'DELETE', credentials: 'include' });
      if (r.ok || r.status === 404) {
        setProfile(p => ({ ...(p || {}), avatar_url: null }));
        push({ title: 'Avatar removed', variant: 'success' });
        return;
      }
      throw new Error(await r.text());
    } catch (e:any) {
      push({ title: 'Remove failed', description: e.message || 'Please try again', variant: 'error' });
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <PageHeader title="Account settings" description="Update your profile, avatar, and preferences." />
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">{error}</div>}

      <section className="border rounded-3xl p-5 bg-white mb-4">
        <h2 className="font-medium mb-3">Avatar</h2>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden grid place-items-center">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" /> : <span className="text-slate-600 text-xl font-semibold">{(profile?.name || profile?.email || 'U')[0]?.toUpperCase()}</span>}
          </div>
          <div className="flex-1">
            <input type="file" accept="image/*" onChange={e => onPickAvatar(e.target.files?.[0] || null)} />
            <div className="mt-2 flex items-center gap-2">
              {avatarPreview && <img src={avatarPreview} alt="Preview" className="h-10 w-10 rounded-full object-cover" />}
              <Button onClick={onUploadAvatar} size="sm" disabled={avatarSaving || !avatarFile}>{avatarSaving ? 'Uploading…' : 'Upload'}</Button>
              {profile?.avatar_url && <button onClick={()=>setConfirmRemove(true)} className="rounded-xl px-3 py-1.5 text-sm border" type="button">Remove avatar</button>}
            </div>
            {avatarError && <p className="text-rose-700 text-xs mt-1">{avatarError}</p>}
            <p className="text-xs text-slate-500 mt-1">PNG or JPG up to 2MB.</p>
          </div>
        </div>
      </section>

      <form onSubmit={onSubmit} className="border rounded-3xl p-5 bg-white mb-4">
        <h2 className="font-medium mb-3">Profile</h2>
        <div className="grid grid-cols-1 gap-3">
          <Field label="Full name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="w-full rounded-xl border px-3 py-2 bg-slate-50 text-slate-600" value={profile?.email || ''} readOnly />
            <p className="text-xs text-slate-500 mt-1">Email is read-only. Contact support to change.</p>
          </div>
          {Array.isArray(profile?.roles) && profile!.roles!.length > 0 && (
            <div className="text-sm text-slate-700"><span className="font-medium">Roles:</span> <span className="text-slate-600">{profile!.roles!.join(', ')}</span></div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          {saved && <span className="text-green-700 text-sm">Saved ✓</span>}
        </div>
      </form>

      <form onSubmit={onSavePrefs} className="border rounded-3xl p-5 bg-white">
        <h2 className="font-medium mb-3">Preferences</h2>
        {prefsError && <div className="mb-3 rounded border border-rose-200 bg-rose-50 text-rose-800 p-2 text-sm">{prefsError}</div>}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Time zone</label>
            <select className="w-full border rounded-xl px-3 py-2" value={prefs.time_zone || ''} onChange={e => setPrefs(p => ({ ...p, time_zone: e.target.value }))}>
              {timeZones.map(tz => (<option key={tz} value={tz}>{tz}</option>))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!prefs.marketing_emails} onChange={e => setPrefs(p => ({ ...p, marketing_emails: e.target.checked }))} /> Receive marketing emails</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!prefs.product_updates} onChange={e => setPrefs(p => ({ ...p, product_updates: e.target.checked }))} /> Product updates</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={prefs.security_alerts !== false} onChange={e => setPrefs(p => ({ ...p, security_alerts: e.target.checked }))} /> Security alerts</label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button disabled={prefsSaving}>{prefsSaving ? 'Saving…' : 'Save preferences'}</Button>
          {prefsSaved && <span className="text-green-700 text-sm">Saved ✓</span>}
        </div>
      </form>

      <div className="text-sm text-slate-700 mt-4">
        <Link href="/dashboard" className="underline">Back to dashboard</Link>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onCancel={() => setConfirmRemove(false)}
        onConfirm={onRemoveAvatar}
        title="Remove avatar?"
        message="This will delete your current profile picture."
        confirmText="Remove"
      />
    </main>
  );
}

export default function ProfileClient(props: { next?: string }) {
  return (
    <ToastProvider>
      <Inner {...props} />
    </ToastProvider>
  );
}
