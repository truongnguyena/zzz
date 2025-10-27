export function triggerConfetti(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('confetti'));
}

