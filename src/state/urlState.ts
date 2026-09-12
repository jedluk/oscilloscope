import type { SerializableScopeState } from "./store";

export function encodeStateToHash(state: SerializableScopeState): string {
  const json = JSON.stringify(state);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `#s=${b64}`;
}

export function decodeStateFromHash(hash: string): Partial<SerializableScopeState> | null {
  const match = /#s=([^&]+)/.exec(hash);
  if (!match) return null;
  try {
    const json = decodeURIComponent(escape(atob(match[1])));
    return JSON.parse(json) as Partial<SerializableScopeState>;
  } catch {
    return null;
  }
}

export function pushStateToUrl(state: SerializableScopeState): void {
  const hash = encodeStateToHash(state);
  window.history.replaceState(null, "", hash);
}
