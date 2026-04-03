interface FlyingAnimationOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number;
  color?: string;
  onComplete?: () => void;
}

export function createFlyingNote(options: FlyingAnimationOptions) {
  const {
    startX,
    startY,
    endX,
    endY,
    duration = 800,
    color = 'var(--color-primary)',
    onComplete
  } = options;

  const note = document.createElement('div');
  note.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="${color}">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  `;
  note.style.cssText = `
    position: fixed;
    width: 24px;
    height: 24px;
    pointer-events: none;
    z-index: 9999;
    opacity: 1;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(note);

  const controlX = (startX + endX) / 2;
  const controlY = Math.min(startY, endY) - 100;

  const startTime = performance.now();
  let animationId: number;

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const t = progress;
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

    note.style.left = `${x}px`;
    note.style.top = `${y}px`;

    const rotation = progress * 360;
    note.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${1 - progress * 0.3})`;

    if (progress > 0.7) {
      note.style.opacity = `${1 - (progress - 0.7) / 0.3}`;
    }

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      document.body.removeChild(note);
      if (onComplete) {
        onComplete();
      }
    }
  }

  animationId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationId);
    if (note.parentNode) {
      document.body.removeChild(note);
    }
  };
}

export function getElementCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}