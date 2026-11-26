import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { login } from '../lib/github';

// The password is checked by the Cloudflare worker (secret CRM_PASSWORD).
// A successful login keeps this device signed in for 30 days, or until "Log out".
export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
        <img src="/logo.png" alt="Heecart" className="mx-auto h-12" />
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold">
          <Lock size={16} className="text-gold-600" /> Store manager login
        </div>
        <div className="mt-5 space-y-3">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                className="input pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink/60">This device stays signed in for 30 days.</p>
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button className="btn-dark w-full" disabled={busy || !password}>{busy ? 'Checking…' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
