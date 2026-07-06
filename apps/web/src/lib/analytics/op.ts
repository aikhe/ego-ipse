import { browser } from '$app/environment';
import { PUBLIC_OPENPANEL_CLIENT_ID } from '$env/static/public';
import { OpenPanel } from '@openpanel/web';

let _op: OpenPanel | null = null;

export function getOpenPanel(): OpenPanel | null {
  if (_op) return _op;
  if (!browser) return null;

  _op = new OpenPanel({
    clientId: PUBLIC_OPENPANEL_CLIENT_ID,
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
  });

  return _op;
}
