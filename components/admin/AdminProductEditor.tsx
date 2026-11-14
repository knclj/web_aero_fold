import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GripVertical,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { adminApi, ApiError } from '../../lib/admin-api';
import {
  defaultSections,
  SECTION_DEFS,
  SECTION_LIST,
  createSection,
  type SectionDefinition,
} from '../../lib/sections';
import { useRouter } from '../../lib/router';
import { formatPrice } from '../../lib/format';
import type { DetailSection, Product, SectionType } from '../../types/product';
import FieldEditor from './FieldEditor';
import { PREVIEW_MESSAGE_TYPE } from './PreviewPage';

const AdminProductEditor: React.FC<{ id: string }> = ({ id }) => {
  const { navigate } = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [sections, setSections] = useState<DetailSection[]>([]);
  const [isCustomized, setIsCustomized] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    adminApi
      .getProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
        setIsCustomized(data.isCustomized);
        setSections(
          data.isCustomized ? data.sections : defaultSections(data.product),
        );
        setDirty(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : '加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const postPreview = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGE_TYPE, sections },
      window.location.origin,
    );
  }, [sections]);

  useEffect(() => {
    postPreview();
  }, [postPreview]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const flash = (message: string, isError = false) => {
    setToastError(isError);
    setToast(message);
  };

  const updateContent = (
    sectionId: string,
    key: string,
    value: unknown,
  ) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, content: { ...section.content, [key]: value } }
          : section,
      ),
    );
    setDirty(true);
  };

  const moveSection = (index: number, delta: number) => {
    setSections((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  };

  const moveSectionTo = (from: number, to: number) => {
    if (from === to) return;
    setSections((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDirty(true);
  };

  const removeSection = (sectionId: string) => {
    if (!window.confirm('删除这个区块？')) return;
    setSections((current) =>
      current.filter((section) => section.id !== sectionId),
    );
    setDirty(true);
  };

  const addSection = (definition: SectionDefinition) => {
    if (!product) return;
    const section = createSection(definition.type, product);
    setSections((current) => [...current, section]);
    setExpanded(section.id);
    setDirty(true);
    window.setTimeout(() => {
      document
        .getElementById(`section-${section.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const save = async () => {
    if (!product || saving) return;
    setSaving(true);
    try {
      const result = await adminApi.saveSections(product.id, sections);
      const nextSections =
        result.sections.length > 0
          ? result.sections
          : defaultSections(product);
      setSections(nextSections);
      setIsCustomized(result.isCustomized);
      setDirty(false);
      flash(
        result.isCustomized
          ? '已保存，前台立即生效。'
          : '已保存：页面为空，前台恢复为默认页面。',
      );
    } catch (err) {
      flash(
        err instanceof ApiError && err.status === 401
          ? '登录已过期，请刷新页面重新登录。'
          : '保存失败，请稍后重试。',
        true,
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!product || saving) return;
    if (!window.confirm('恢复为默认页面？已保存的定制区块会被清除。')) return;
    setSaving(true);
    try {
      await adminApi.resetSections(product.id);
      setSections(defaultSections(product));
      setIsCustomized(false);
      setDirty(false);
      flash('已恢复默认页面。');
    } catch {
      flash('重置失败，请稍后重试。', true);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (dirty && !window.confirm('有未保存的修改，确定离开？')) return;
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-zinc-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-100 px-6 text-center">
        <p className="text-sm text-zinc-500">{loadError ?? '产品不存在。'}</p>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
        >
          返回产品列表
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-black">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-black"
          >
            <ArrowLeft size={14} />
            产品列表
          </button>
          <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold uppercase tracking-wide">
              {product.title}
            </h1>
            <p className="mt-0.5 flex items-center gap-2 text-[10px] text-zinc-400">
              <span>{formatPrice(product.priceCents)}</span>
              <span>·</span>
              <span>{isCustomized ? '自定义页面' : '默认页面'}</span>
              {dirty ? (
                <span className="font-bold text-amber-600">未保存</span>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen((open) => !open)}
            className="border border-zinc-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 xl:hidden"
          >
            {previewOpen ? '收起预览' : '预览'}
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 border border-zinc-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:border-black hover:text-black disabled:opacity-40"
          >
            <RotateCcw size={13} />
            恢复默认
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            保存
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <main className="min-w-0">
          {!isCustomized ? (
            <div className="mb-5 border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
              当前使用<strong>默认页面</strong>（产品介绍 + 图库 + 询价区）。
              编辑并保存后，这个产品会切换为自定义页面。
            </div>
          ) : null}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              页面区块（{sections.length}）
            </h2>
            {sections.length > 0 ? (
              <a
                href={`/product/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-black"
              >
                前台打开
                <ExternalLink size={12} />
              </a>
            ) : null}
          </div>

          <div className="space-y-3">
            {sections.map((section, index) => {
              const definition = SECTION_DEFS[section.type];
              const open = expanded === section.id;
              return (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className={`border bg-white transition-colors ${
                    dragOverIndex === index && dragIndex !== index
                      ? 'border-black'
                      : 'border-zinc-200'
                  } ${dragIndex === index ? 'opacity-50' : ''}`}
                  onDragOver={(event) => {
                    if (dragIndex === null) return;
                    event.preventDefault();
                    setDragOverIndex(index);
                  }}
                  onDragLeave={() =>
                    setDragOverIndex((current) =>
                      current === index ? null : current,
                    )
                  }
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragIndex !== null) moveSectionTo(dragIndex, index);
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                >
                  <div className="flex items-center gap-2 px-3 py-3 md:px-4">
                    <span
                      draggable
                      onDragStart={(event) => {
                        setDragIndex(index);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', section.id);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      title="拖动排序"
                      className="cursor-grab p-0.5 text-zinc-300 transition-colors hover:text-black active:cursor-grabbing"
                    >
                      <GripVertical size={15} />
                    </span>
                    <span className="w-6 shrink-0 text-[10px] font-mono text-zinc-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : section.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="shrink-0 text-xs font-bold uppercase tracking-wide">
                        {definition.label}
                      </span>
                      <span className="hidden truncate text-[10px] font-light text-zinc-400 md:block">
                        {definition.description}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`ml-auto shrink-0 text-zinc-400 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(index, -1)}
                        disabled={index === 0}
                        aria-label="上移"
                        className="p-1.5 text-zinc-400 transition-colors hover:text-black disabled:opacity-20"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(index, 1)}
                        disabled={index === sections.length - 1}
                        aria-label="下移"
                        className="p-1.5 text-zinc-400 transition-colors hover:text-black disabled:opacity-20"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        aria-label="删除区块"
                        className="p-1.5 text-zinc-400 transition-colors hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {open ? (
                    <div className="space-y-4 border-t border-zinc-100 bg-zinc-50/60 p-4 md:p-5">
                      {definition.fields.map((field) => (
                        <FieldEditor
                          key={field.key}
                          field={field}
                          value={section.content[field.key]}
                          onChange={(value) =>
                            updateContent(section.id, field.key, value)
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {sections.length === 0 ? (
            <div className="border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
              <p className="text-sm font-medium text-zinc-500">
                这个页面还没有区块
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                从下方添加区块；若保持为空并保存，前台会显示默认页面。
              </p>
            </div>
          ) : null}

          <div className="mt-8 border border-zinc-300 bg-white p-4 md:p-5">
            <div className="flex items-center gap-2">
              <Plus size={14} />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                添加区块
              </h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTION_LIST.map((definition) => (
                <button
                  key={definition.type}
                  type="button"
                  onClick={() => addSection(definition)}
                  className="group flex flex-col items-start gap-1 border border-zinc-200 px-3 py-3 text-left transition-colors hover:border-black hover:bg-black hover:text-white"
                >
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {definition.label}
                  </span>
                  <span className="text-[10px] font-light leading-snug text-zinc-400 group-hover:text-zinc-300">
                    {definition.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
            <span>页面地址：/product/{product.id}</span>
            <span>·</span>
            <span>
              {product.published ? '产品已发布' : '产品未发布（仅管理员可见）'}
            </span>
          </div>
        </main>

        <aside
          className={`${
            previewOpen ? 'block' : 'hidden'
          } xl:sticky xl:top-20 xl:block xl:self-start`}
        >
          <div className="border border-zinc-200 bg-white p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                实时预览
              </span>
              <a
                href={`/product/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-black"
              >
                新窗口
                <ExternalLink size={11} />
              </a>
            </div>
            <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[1.75rem] border-[9px] border-black bg-white shadow-xl">
              <iframe
                ref={iframeRef}
                src={`/admin/preview/product/${product.id}`}
                title="产品详情页实时预览"
                onLoad={postPreview}
                className="h-[640px] w-full bg-white"
              />
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-400">
              预览随编辑实时更新，无需先保存
            </p>
          </div>
        </aside>
      </div>

      {toast ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-5 py-3 text-xs font-medium shadow-lg ${
            toastError ? 'bg-red-600 text-white' : 'bg-black text-white'
          }`}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default AdminProductEditor;
