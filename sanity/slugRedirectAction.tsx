'use client';

import { useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity';
import { primaryHref } from './lib/docPageUrl';

/** Auto-redirect on slug change. Wraps the default Publish action: when an
 *  editor renames a page's slug and publishes, we create a 301 redirect from
 *  the OLD public path to the NEW one, so printed QR codes, newsletter links
 *  and Google keep working, no admin, no deploy. Guards against redirect
 *  loops (renaming back) and repoints existing chains. Redirect creation runs
 *  in the background and never blocks or fails the publish.
 *
 *  Only wired for the slug-bearing page types below (see sanity.config.ts).
 *  The redirect shape matches sanity/schemaTypes/redirect.ts, consumed by
 *  proxy.ts. */

export const REDIRECTABLE = new Set(['post', 'landingPage', 'supportPage', 'trade', 'legalPage']);

const API_VERSION = '2024-11-01';

export function wrapPublishWithRedirect(original: DocumentActionComponent): DocumentActionComponent {
  const Wrapped: DocumentActionComponent = (props: DocumentActionProps) => {
    const client = useClient({ apiVersion: API_VERSION });
    const orig = original(props);
    if (!orig) return orig;

    return {
      ...orig,
      onHandle: () => {
        // Capture old (last published) vs new (about to publish) paths BEFORE
        // publishing flips them.
        const from = primaryHref(props.type, props.published as Record<string, unknown> | null);
        const to = primaryHref(props.type, props.draft as Record<string, unknown> | null);

        // Publish immediately; never make the editor wait on the redirect.
        orig.onHandle?.();

        if (from && to && from !== to) {
          void (async () => {
            try {
              // Loop guard: drop any redirect that would bounce the NEW path away.
              const loopIds: string[] = await client.fetch('*[_type=="redirect" && from==$to]._id', { to });
              // Chain fix: redirects that pointed AT the old path now point to new.
              const chainIds: string[] = await client.fetch('*[_type=="redirect" && to==$from]._id', { from });
              const existingId: string | null = await client.fetch('*[_type=="redirect" && from==$from][0]._id', { from });

              const tx = client.transaction();
              for (const id of loopIds) tx.delete(id);
              for (const id of chainIds) tx.patch(id, (p) => p.set({ to }));
              if (existingId) tx.patch(existingId, (p) => p.set({ to, permanent: true }));
              else tx.create({ _type: 'redirect', from, to, permanent: true });
              await tx.commit();
            } catch {
              /* redirect is best-effort; a failure must never affect publish */
            }
          })();
        }
      },
    };
  };
  return Wrapped;
}
