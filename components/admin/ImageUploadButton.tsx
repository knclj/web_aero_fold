import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/admin-api';

interface ImageUploadButtonProps {
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
  onError?: (message: string) => void;
}

/** Uploads one or more images to the API and returns their public URLs. */
const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onUploaded,
  multiple = false,
  label = '上传图片',
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []) as File[];
    // Clear immediately so selecting the same file again still fires a change.
    event.target.value = '';
    if (files.length === 0 || busy) return;

    setBusy(true);
    const urls: string[] = [];
    try {
      for (const file of files) {
        const result = await adminApi.uploadImage(file);
        urls.push(result.url);
      }
      onUploaded(urls);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '上传失败，请稍后重试';
      onError?.(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:border-black hover:text-black disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ImagePlus size={14} />
        )}
        {busy ? '上传中…' : label}
      </button>
    </>
  );
};

export default ImageUploadButton;
