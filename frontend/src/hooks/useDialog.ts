import { useEffect, useRef } from 'react';

// One lifecycle for focus, Escape and keyboard containment in modal surfaces.
export function useDialog(onClose: () => void, active = true) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    if (!root) return;
    const selector = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';
    const controls = () => Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(item => item.getClientRects().length > 0);
    (controls()[0] || root).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); root.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', keydown);
    return () => { root.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, [active]);
  return ref;
}
