import React, { useEffect, useMemo, useRef, useState } from 'react';
import qrcode from 'qrcode-generator';
import { Check, Copy, Download, X } from 'lucide-react';
import type { Product } from '../../types/product';
import { slugify } from '../../lib/format';

interface ShareQrModalProps {
  product: Product;
  onClose: () => void;
}

/**
 * Renders the QR code on a canvas and exports a real PNG.
 * (qrcode-generator's own createDataURL returns a GIF.)
 */
function createQrPngDataUrl(value: string, cellSize = 8, margin = 4): string {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();

  const count = qr.getModuleCount();
  const size = (count + margin * 2) * cellSize;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          (col + margin) * cellSize,
          (row + margin) * cellSize,
          cellSize,
          cellSize,
        );
      }
    }
  }
  return canvas.toDataURL('image/png');
}

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // Fallback for non-secure contexts where the Clipboard API is unavailable.
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

const ShareQrModal: React.FC<ShareQrModalProps> = ({ product, onClose }) => {
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const url = `${window.location.origin}/product/${product.id}`;
  const qrDataUrl = useMemo(() => createQrPngDataUrl(url), [url]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleCopy = async () => {
    await copyText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${slugify(product.title)}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Product QR code"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-white p-8 text-black shadow-2xl">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-zinc-400 transition-colors hover:text-black"
        >
          <X size={20} />
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
          Scan to open
        </p>
        <h3 className="mt-2 pr-6 text-lg font-black uppercase leading-tight tracking-tight">
          {product.title}
        </h3>

        <div className="mt-6 border border-zinc-200 p-3">
          <img
            src={qrDataUrl}
            alt={`QR code for ${product.title}`}
            className="h-auto w-full"
          />
        </div>

        <p className="mt-4 break-all text-center text-[11px] font-light text-zinc-500">
          {url}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 border border-black px-3 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 bg-black px-3 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
          >
            <Download size={14} />
            Save PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareQrModal;
