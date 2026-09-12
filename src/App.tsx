import { useEffect, useRef } from "react";
import { Panel } from "./ui/Panel";
import { useScopeStore, getSerializableState } from "./state/store";
import { decodeStateFromHash, pushStateToUrl } from "./state/urlState";

function App() {
  const loadedFromUrl = useRef(false);

  useEffect(() => {
    if (loadedFromUrl.current) return;
    loadedFromUrl.current = true;
    const fromHash = decodeStateFromHash(window.location.hash);
    if (fromHash) useScopeStore.getState().loadState(fromHash);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const unsub = useScopeStore.subscribe((state) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => pushStateToUrl(getSerializableState(state)), 400);
    });
    return () => {
      unsub();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return <Panel />;
}

export default App;
