import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from 'lucide-react';
import { adminApi, ApiError } from '../../lib/admin-api';
import ImageUploadButton from './ImageUploadButton';
import { useRouter } from '../../lib/router';
import type { Product } from '../../types/product';

const AdminProductForm: React.FC<{ id?: string }> = ({ id }) => {
  const { navigate } = useRouter();
  const isEdit = Boolean(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [published, setPublished] = useState(true);
  const [imagesText, setImagesText] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    adminApi
      .getProduct(id)
      .then((data) => {
        if (cancelled) return;
        const item = data.product;
        setProduct(item);
        setTitle(item.title);
        setCategory(item.category);
        setDescription(item.description);
        setPrice(
          item.priceCents === null
            ? ''
            : String(Math.round(item.priceCents) / 100),
        );
        setPublished(item.published);
        setImagesText(item.images.map((image) => image.url).join('\n'));
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
  }, [id]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('请填写产品名称。');
      return;
    }

    let priceCents: number | null = null;
    if (price.trim() !== '') {
      const value = Number(price);
      if (!Number.isFinite(value) || value < 0) {
        setError('价格格式不正确，请填写美元金额（例如 129 或 129.90）。');
        return;
      }
      priceCents = Math.round(value * 100);
    }

    const images = imagesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      title: trimmedTitle,
      category: category.trim(),
      description,
      priceCents,
      published,
      images,
    };

    setSaving(true);
    try {
      if (id) {
        await adminApi.updateProduct(id, payload);
        navigate('/admin');
      } else {
        const created = await adminApi.createProduct(payload);
        navigate(`/admin/product/${created.product.id}`);
      }
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? '登录已过期，请刷新页面重新登录。'
          : err instanceof Error
            ? err.message
            : '保存失败，请稍后重试。';
      setError(message);
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id || !product || saving) return;
    if (
      !window.confirm(
        `删除产品“${product.title}”？其详情页区块也会一并删除，此操作不可撤销。`,
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await adminApi.deleteProduct(id);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败。');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-zinc-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-black">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-black"
          >
            <ArrowLeft size={14} />
            产品列表
          </button>
          <h1 className="text-sm font-bold uppercase tracking-wide">
            {isEdit ? '编辑产品资料' : '新建产品'}
          </h1>
          {product ? (
            <a
              href={`/product/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-black"
            >
              查看详情页
              <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <form
          onSubmit={submit}
          className="border border-zinc-200 bg-white p-5 md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                产品名称 *
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="例如 Series 01"
                className="w-full border border-zinc-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-black"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                分类
              </span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                maxLength={80}
                placeholder="例如 Traveler"
                className="w-full border border-zinc-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-black"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                价格（美元）
              </span>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                inputMode="decimal"
                placeholder="留空则显示 Price on request"
                className="w-full border border-zinc-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-black"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                产品描述
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="用于产品详情页顶部介绍，也会作为默认页面的正文。"
                className="w-full resize-y border border-zinc-300 px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-black"
              />
            </label>

            <div className="block md:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  产品图片（每行一个，第一张为封面）
                </span>
                <ImageUploadButton
                  multiple
                  label="上传图片"
                  onUploaded={(urls) =>
                    setImagesText((previous) =>
                      [
                        ...previous
                          .split('\n')
                          .map((line) => line.trim())
                          .filter(Boolean),
                        ...urls,
                      ].join('\n'),
                    )
                  }
                  onError={setError}
                />
              </div>
              <textarea
                value={imagesText}
                onChange={(event) => setImagesText(event.target.value)}
                rows={4}
                placeholder="https://raw.githubusercontent.com/..."
                className="w-full resize-y border border-zinc-300 px-3 py-2.5 font-mono text-xs leading-relaxed outline-none transition-colors focus:border-black"
              />
              <span className="mt-2 block text-[11px] font-light text-zinc-400">
                支持 JPG / PNG / WebP / GIF / AVIF，单张不超过 8MB；也可以直接粘贴图片外链。
              </span>
            </div>
          </div>

          {imagesText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)[0] ? (
            <div className="mt-4 w-40 border border-zinc-200 bg-zinc-50 p-2">
              <img
                src={
                  imagesText
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)[0]
                }
                alt="封面预览"
                className="aspect-[4/3] w-full object-cover"
              />
              <p className="mt-1 text-center text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                封面预览
              </p>
            </div>
          ) : null}

          <label className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <span className="text-sm">
              发布到网站
              <span className="ml-2 text-xs font-light text-zinc-400">
                未发布的产品不会出现在首页，但详情页链接仍可由管理员预览
              </span>
            </span>
          </label>

          {error ? (
            <p className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isEdit ? '保存资料' : '创建并编辑详情页'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="border border-zinc-300 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 transition-colors hover:border-black hover:text-black"
            >
              取消
            </button>
            {isEdit ? (
              <button
                type="button"
                onClick={remove}
                disabled={saving}
                className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 transition-colors hover:text-red-700 disabled:opacity-40"
              >
                <Trash2 size={13} />
                删除产品
              </button>
            ) : null}
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminProductForm;
