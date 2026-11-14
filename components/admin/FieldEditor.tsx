import React, { useState } from 'react';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import type { FieldDef } from '../../lib/sections';
import ImageUploadButton from './ImageUploadButton';

interface FieldEditorProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}

const inputClass =
  'w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-black';

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

const FieldLabel: React.FC<{ children: React.ReactNode; help?: string }> = ({
  children,
  help,
}) => (
  <div className="mb-1.5 flex items-baseline justify-between gap-3">
    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
      {children}
    </span>
    {help ? (
      <span className="text-[10px] font-light text-zinc-400">{help}</span>
    ) : null}
  </div>
);

const ImagePreview: React.FC<{ url: string; className?: string }> = ({
  url,
  className = 'h-24 w-24',
}) => {
  if (!url) return null;
  return (
    <div className={`mt-2 overflow-hidden border border-zinc-200 bg-zinc-50 ${className}`}>
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover"
        onError={(event) => {
          (event.currentTarget as HTMLImageElement).style.opacity = '0.2';
        }}
      />
    </div>
  );
};

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  value,
  onChange,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  switch (field.kind) {
    case 'text':
      return (
        <label className="block">
          <FieldLabel help={field.help}>{field.label}</FieldLabel>
          <input
            value={asString(value)}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder}
            className={inputClass}
          />
        </label>
      );

    case 'textarea':
      return (
        <label className="block">
          <FieldLabel help={field.help}>{field.label}</FieldLabel>
          <textarea
            value={asString(value)}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder}
            rows={field.rows ?? 4}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </label>
      );

    case 'select':
      return (
        <label className="block">
          <FieldLabel help={field.help}>{field.label}</FieldLabel>
          <select
            value={asString(value) || field.options?.[0]?.value || ''}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
          >
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );

    case 'image': {
      const url = asString(value);
      return (
        <div>
          <FieldLabel help={field.help}>{field.label}</FieldLabel>
          <div className="flex items-start gap-2">
            <input
              value={url}
              onChange={(event) => onChange(event.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
            />
            <ImageUploadButton
              onUploaded={(urls) => {
                if (urls[0]) {
                  onChange(urls[0]);
                  setUploadError(null);
                }
              }}
              onError={setUploadError}
            />
          </div>
          <ImagePreview url={url} />
          {uploadError ? (
            <p className="mt-1 text-[11px] text-red-500">{uploadError}</p>
          ) : null}
        </div>
      );
    }

    case 'images': {
      const images = asStringArray(value);
      const update = (next: string[]) => onChange(next);
      return (
        <div>
          <FieldLabel help={field.help}>{field.label}</FieldLabel>
          <div className="space-y-2">
            {images.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-12 w-12 shrink-0 overflow-hidden border border-zinc-200 bg-zinc-50">
                  {url ? (
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <input
                  value={url}
                  onChange={(event) => {
                    const next = [...images];
                    next[index] = event.target.value;
                    update(next);
                  }}
                  placeholder="https://…"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => update(images.filter((_, i) => i !== index))}
                  aria-label="删除图片"
                  className="shrink-0 p-2 text-zinc-400 transition-colors hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => update([...images, ''])}
              className="inline-flex items-center gap-1.5 border border-dashed border-zinc-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:border-black hover:text-black"
            >
              <ImagePlus size={13} />
              添加图片
            </button>
            <ImageUploadButton
              multiple
              onUploaded={(urls) => {
                update([...images, ...urls]);
                setUploadError(null);
              }}
              onError={setUploadError}
            />
          </div>
          {uploadError ? (
            <p className="mt-1 text-[11px] text-red-500">{uploadError}</p>
          ) : null}
        </div>
      );
    }

    case 'list': {
      const items = Array.isArray(value)
        ? value.filter(
            (item): item is Record<string, unknown> =>
              Boolean(item) && typeof item === 'object' && !Array.isArray(item),
          )
        : [];
      const itemFields = field.itemFields ?? [];

      const updateItem = (index: number, patch: Record<string, unknown>) => {
        const next = items.map((item, i) =>
          i === index ? { ...item, ...patch } : item,
        );
        onChange(next);
      };

      return (
        <div>
          <FieldLabel help={field.help}>{field.label}</FieldLabel>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="border border-zinc-200 bg-zinc-50/60 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    {field.itemLabel ?? '条目'} {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(items.filter((_, i) => i !== index))
                    }
                    aria-label="删除条目"
                    className="text-zinc-400 transition-colors hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {itemFields.map((subField) => (
                    <FieldEditor
                      key={subField.key}
                      field={subField}
                      value={item[subField.key]}
                      onChange={(next) =>
                        updateItem(index, { [subField.key]: next })
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange([...items, asRecord(field.newItem?.())])}
            className="mt-3 inline-flex items-center gap-1.5 bg-zinc-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:bg-black hover:text-white"
          >
            <Plus size={13} />
            添加{field.itemLabel ?? '条目'}
          </button>
        </div>
      );
    }

    default:
      return null;
  }
};

export default FieldEditor;
