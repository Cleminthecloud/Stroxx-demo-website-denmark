'use client';

import { EyeOpenIcon, EditIcon } from '@sanity/icons';
import type { DocumentActionComponent, DocumentActionProps } from 'sanity';
import { primaryHref } from './lib/docPageUrl';

/** "See page ↗": opens the live public page for this document in a new tab
 *  (published content). Hidden for documents with no standalone page. */
export const seePageAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const href = primaryHref(props.type, (props.draft || props.published) as Record<string, unknown> | null);
  if (!href) return null;
  return {
    label: 'See page',
    icon: EyeOpenIcon,
    onHandle: () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      window.open(`${origin}${href}`, '_blank', 'noopener,noreferrer');
      props.onComplete();
    },
  };
};

/** "Open in Edit site": jumps into the Presentation (visual) editor focused on
 *  this document's page, so edits show in-place against the live site. */
export const openInPresentationAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const href = primaryHref(props.type, (props.draft || props.published) as Record<string, unknown> | null);
  if (!href) return null;
  return {
    label: 'Open in Edit site',
    icon: EditIcon,
    onHandle: () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      window.location.href = `${origin}/studio/presentation?preview=${encodeURIComponent(href)}`;
      props.onComplete();
    },
  };
};
