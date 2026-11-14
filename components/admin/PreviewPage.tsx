import React, { useEffect } from 'react';
import ProductPage from '../product/ProductPage';
import type { DetailSection } from '../../types/product';

export const PREVIEW_MESSAGE_TYPE = 'wf:preview-sections';

/**
 * Route rendered inside the admin editor's iframe. It receives unsaved section
 * data via postMessage so the preview stays accurate without hitting the DB.
 */
const PreviewPage: React.FC<{ id: string }> = ({ id }) => {
  const [sections, setSections] = React.useState<DetailSection[] | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; sections?: unknown };
      if (data?.type !== PREVIEW_MESSAGE_TYPE) return;
      if (!Array.isArray(data.sections)) return;
      setSections(data.sections as DetailSection[]);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <ProductPage
      id={id}
      preview
      overrideSections={sections ?? undefined}
    />
  );
};

export default PreviewPage;
