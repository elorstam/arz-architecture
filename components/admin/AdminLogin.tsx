'use client';
import {useState} from 'react';

type Step = 'password' | 'setup' | 'code';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('password');
  const [secret, setSecret] = useState('');
  const [uri, setUri] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({password, code: step === 'password' ? '' : code})
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.ok) location.reload();
    else if (response.ok && data.requiresSetup) {
      setSecret(data.secret);
      setUri(data.otpauthUri);
      setStep('setup');
    } else if (response.ok && data.requiresTwoFactor) setStep('code');
    else setError(data.error || 'Giriş yapılamadı');
    setLoading(false);
  }

  return <div className="flex min-h-screen items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-md border border-white/15 bg-white/[.03] p-8">
      <p className="text-[10px] uppercase tracking-[.35em] text-white/40">ARZ Mimarlık</p>
      <h1 className="mt-4 text-4xl font-light">Admin Paneli</h1>

      {step === 'password' ? <>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Yönetici şifresi" autoFocus className="mt-10 w-full border border-white/20 bg-transparent px-4 py-3 outline-none focus:border-white/60"/>
        <button disabled={loading} className="mt-4 w-full bg-white px-4 py-3 text-black">{loading ? 'Kontrol ediliyor…' : 'Devam et'}</button>
      </> : <>
        {step === 'setup' && <div className="mt-8 border border-white/15 bg-black/30 p-4 text-sm leading-6 text-white/70">
          <p className="font-medium text-white">Google Authenticator kurulumu</p>
          <p className="mt-2">Google Authenticator’da <strong>Kurulum anahtarı gir</strong> seçeneğini aç ve aşağıdaki anahtarı ekle.</p>
          <div className="mt-4 break-all border border-white/15 bg-black/50 p-3 font-mono text-xs tracking-wider text-white">{secret}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => navigator.clipboard.writeText(secret)} className="border border-white/20 px-3 py-2 text-xs">Anahtarı kopyala</button>
            <a href={uri} className="border border-white/20 px-3 py-2 text-xs">Authenticator’da aç</a>
          </div>
          <p className="mt-3 text-xs text-amber-200/70">Hesap türü: Zamana dayalı. Bu anahtarı güvenli bir yerde sakla.</p>
        </div>}
        <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="6 haneli kod" autoFocus className="mt-6 w-full border border-white/20 bg-transparent px-4 py-3 text-center text-2xl tracking-[.45em] outline-none focus:border-white/60"/>
        <button disabled={loading || code.length !== 6} className="mt-4 w-full bg-white px-4 py-3 text-black">{loading ? 'Doğrulanıyor…' : step === 'setup' ? 'Kurulumu tamamla' : 'Giriş yap'}</button>
        <button type="button" onClick={() => {setStep('password'); setCode(''); setError('')}} className="mt-3 w-full text-xs text-white/45">Şifre ekranına dön</button>
      </>}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <p className="mt-6 text-xs leading-5 text-white/35">Yönetici şifresi <code>.env.local</code> içindeki <code>ADMIN_PASSWORD</code> değeridir.</p>
    </form>
  </div>;
}
