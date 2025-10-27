// kurumi marker (hidden signature)
const KURUMI_SIGNATURE = 'kurumi-stm-2025';

try {
  const root = document.documentElement;
  if (root && !root.getAttribute('data-kurumi')) {
    root.setAttribute('data-kurumi', KURUMI_SIGNATURE);
    const style = document.createElement('style');
    style.setAttribute('data-kurumi', '1');
    style.textContent = `/* kurumi */:root{--kurumi:'${KURUMI_SIGNATURE}';}`;
    document.head.appendChild(style);
  }
} catch {}

export {};

