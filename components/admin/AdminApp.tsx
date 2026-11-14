import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ExternalLink,
  GripVertical,
  LayoutTemplate,
  Loader2,
  LogOut,
  Plus,
  Search,
} from 'lucide-react';
import { adminApi } from '../../lib/admin-api';
import { Link } from '../../lib/router';
import { formatPrice } from '../../lib/format';
import type { AdminProduct } from '../../types/product';

const AdminApp: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .listProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword),
    );
  }, [products, query]);

  const publishedCount = products.filter((product) => product.published).length;
  const customizedCount = products.filter(
    (product) => product.isCustomized,
  ).length;

  const persistOrder = async (
    next: AdminProduct[],
    previous: AdminProduct[],
  ) => {
    setProducts(next);
    try {
      await adminApi.reorderProducts(next.map((product) => product.id));
    } catch (err) {
      setProducts(previous);
      setError(err instanceof Error ? err.message : '排序保存失败，请重试');
    }
  };

  const handleDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const from = products.findIndex((product) => product.id === dragId);
    const to = products.findIndex((product) => product.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...products];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void persistOrder(next, products);
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-black">
      <header className="bg-[#0a0a0a] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-black tracking-[0.25em] transition-opacity hover:opacity-70"
            >
              AERO-FOLD
            </Link>
            <span className="hidden text-[10px] uppercase tracking-[0.35em] text-zinc-500 sm:inline">
              内容后台
            </span>
          </div>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.25em]">
            <Link
              to="/"
              className="hidden text-zinc-400 transition-colors hover:text-white sm:inline"
            >
              查看网站
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
            >
              <LogOut size={14} />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">
              Product pages
            </p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-5xl">
              产品详情页
            </h1>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-zinc-500">
              为每个产品自由搭建详情页区块：添加、排序、编辑，右侧实时预览。
              保存后立即对访客生效；未定制的产品使用默认页面。
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-2xl font-black">{products.length}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                全部产品
              </p>
            </div>
            <div>
              <p className="text-2xl font-black">{publishedCount}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                已发布
              </p>
            </div>
            <div>
              <p className="text-2xl font-black">{customizedCount}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                已定制
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 border border-zinc-300 bg-white px-4 py-3">
            <Search size={16} className="text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索产品名称或分类…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
          >
            <Plus size={14} />
            新建产品
          </Link>
        </div>

        <p className="mt-3 text-[11px] font-light text-zinc-400">
          {query
            ? '清空搜索后可拖动卡片调整顺序。'
            : '拖动卡片右上角的手柄，可调整产品在首页的展示顺序。'}
        </p>

        {loading ? (
          <div className="flex justify-center py-24 text-zinc-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : null}

        {error ? (
          <p className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <article
                key={product.id}
                onDragOver={(event) => {
                  if (dragId === null || query) return;
                  event.preventDefault();
                  setOverId(product.id);
                }}
                onDragLeave={() =>
                  setOverId((current) =>
                    current === product.id ? null : current,
                  )
                }
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragId !== null) handleDrop(product.id);
                  setDragId(null);
                  setOverId(null);
                }}
                className={`group flex flex-col border bg-white transition-shadow ${
                  overId === product.id && dragId !== product.id
                    ? 'border-black ring-2 ring-black'
                    : 'border-zinc-200'
                } ${dragId === product.id ? 'opacity-50' : ''}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                      暂无图片
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span
                      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${
                        product.published
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                      }`}
                    >
                      {product.published ? '已发布' : '未发布'}
                    </span>
                    {product.isCustomized ? (
                      <span className="bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                        已定制
                      </span>
                    ) : null}
                  </div>
                  {!query ? (
                    <span
                      draggable
                      onDragStart={(event) => {
                        setDragId(product.id);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', String(product.id));
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverId(null);
                      }}
                      title="拖动排序"
                      className="absolute right-3 top-3 z-10 cursor-grab bg-white/90 p-1.5 text-zinc-500 shadow-sm transition-colors hover:text-black active:cursor-grabbing"
                    >
                      <GripVertical size={14} />
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                    {product.category || '未分类'}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-sm font-bold uppercase leading-snug tracking-wide">
                    {product.title}
                  </h2>
                  <p className="mt-2 text-xs font-light text-zinc-500">
                    {formatPrice(product.priceCents)}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-5">
                    <Link
                      to={`/admin/product/${product.id}`}
                      className="inline-flex items-center gap-1.5 bg-black px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
                    >
                      <LayoutTemplate size={12} />
                      编辑详情页
                    </Link>
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-black"
                    >
                      编辑资料
                    </Link>
                    {product.published ? (
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-black"
                      >
                        预览
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-zinc-300">
                        发布后可预览
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <p className="py-24 text-center text-sm text-zinc-400">
            没有找到匹配的产品。
          </p>
        ) : null}

        <p className="mt-10 flex items-center gap-2 text-[11px] text-zinc-400">
          <ArrowUpRight size={12} />
          提示：详情页地址形如 /product/&lt;id&gt;，可直接分享或生成二维码。
        </p>
      </main>
    </div>
  );
};

export default AdminApp;
