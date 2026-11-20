import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { adminApi, ApiError } from '../../lib/admin-api';
import { Link } from '../../lib/router';
import { usePageSeo } from '../../lib/seo';
import { NOINDEX_ROBOTS } from '../../lib/site';

type AuthStatus = 'checking' | 'anonymous' | 'authenticated';

const AdminGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('checking');

  usePageSeo(
    {
      title: 'Admin | AERO-FOLD',
      description: 'Private administration area for the AERO-FOLD product catalogue.',
      canonical: false,
      robots: NOINDEX_ROBOTS,
      jsonLd: [],
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    adminApi
      .me()
      .then((result) => {
        if (!cancelled) {
          setStatus(result.authenticated ? 'authenticated' : 'anonymous');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('anonymous');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-zinc-500">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (status === 'anonymous') {
    return (
      <LoginForm onSuccess={() => setStatus('authenticated')} />
    );
  }

  return <>{children}</>;
};

const LoginForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi.login(password);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? '尝试次数过多，请稍后再试。'
          : '密码不正确，请重试。',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to site
        </Link>

        <div className="mt-8 border border-zinc-800 bg-[#111111] p-8 md:p-10">
          <div className="flex items-center gap-3 text-zinc-500">
            <Lock size={16} />
            <span className="text-[10px] uppercase tracking-[0.4em]">
              AERO-FOLD Admin
            </span>
          </div>
          <h1 className="mt-5 text-2xl font-black uppercase tracking-tight">
            管理员登录
          </h1>
          <p className="mt-3 text-sm font-light leading-relaxed text-zinc-400">
            登录后可以为每个产品搭建详情页区块，保存后立即对访客生效。
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                密码
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                autoComplete="current-password"
                className="mt-2 w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white"
                placeholder="输入管理员密码"
              />
            </label>

            {error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={!password || busy}
              className="flex w-full items-center justify-center gap-2 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              登录
            </button>
          </form>

          {import.meta.env.DEV ? (
            <p className="mt-6 border-t border-zinc-800 pt-4 text-[11px] leading-relaxed text-zinc-600">
              开发环境未设置 ADMIN_PASSWORD 时，默认密码为 admin123。
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminGate;
