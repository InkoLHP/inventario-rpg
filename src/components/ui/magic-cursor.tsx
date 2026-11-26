import { useEffect, useRef } from "react";

interface MagicCursorProps {
  size?: number;
  color?: string;
}

export function MagicCursor({ size = 38, color = "#f2c66d" }: MagicCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("magic-cursor-active");
    let targetX = -100;
    let targetY = -100;
    let x = targetX;
    let y = targetY;
    let velocityX = 0;
    let velocityY = 0;
    let rotation = 0;
    let previousTime = performance.now();
    let frameId = 0;

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.style.opacity = "1";
    };
    const onPointerLeave = () => {
      cursor.style.opacity = "0";
    };

    const animate = (time: number) => {
      const delta = Math.min(0.05, (time - previousTime) / 1000);
      previousTime = time;
      const ease = 1 - Math.exp(-delta / 0.025);
      const previousX = x;
      const previousY = y;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      if (delta > 0) {
        const velocityEase = 1 - Math.exp(-delta / 0.06);
        velocityX += ((x - previousX) / delta - velocityX) * velocityEase;
        velocityY += ((y - previousY) / delta - velocityY) * velocityEase;
      }
      const speed = Math.hypot(velocityX, velocityY);
      const targetRotation = speed > 55 ? Math.atan2(velocityY, velocityX) * 0.12 : 0;
      rotation += (targetRotation - rotation) * (1 - Math.exp(-delta / 0.08));
      const stretch = 1 + Math.min(speed / 3600, 0.22);
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}rad) scale(${1 / Math.sqrt(stretch)}, ${stretch})`;
      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.documentElement.classList.remove("magic-cursor-active");
    };
  }, []);

  return (
    <div ref={cursorRef} className="magic-cursor" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 44 48" fill="none" className="h-full w-full drop-shadow-[0_3px_6px_rgba(0,0,0,.7)]">
        <path d="M8 24V12a3.5 3.5 0 0 1 7 0v8-13a3.5 3.5 0 0 1 7 0v13-10a3.5 3.5 0 0 1 7 0v12l2-5a3.5 3.5 0 0 1 6.5 2.6l-5.6 16A10 10 0 0 1 22 42h-2c-5 0-8-3-10-7l-5-8a3.5 3.5 0 0 1 5-4l4 4" fill="#9da7aa" stroke="#35271a" strokeLinejoin="round" strokeWidth="3" />
        <path d="M15 19h7m0 1h7m0 2h7M12 30l7-3 6 4-6 5-7-2" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="m19 7 3-3 3 3m-3-1v9" stroke="#734312" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </div>
  );
}
