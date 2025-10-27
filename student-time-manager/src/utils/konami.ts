const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let idx = 0;
export function enableKonami(callback: () => void) {
  function onKey(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    const target = SEQ[idx].toLowerCase();
    if (key === target) {
      idx += 1; if (idx === SEQ.length) { idx = 0; callback(); }
    } else {
      idx = 0;
    }
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}

