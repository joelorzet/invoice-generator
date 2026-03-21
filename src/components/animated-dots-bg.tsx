"use client";

import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function AnimatedDotsBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef<Dot[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spacing = 28;
    const dotSize = 1.8;
    const mouseRadius = 120;
    const returnSpeed = 0.03;
    const driftSpeed = 0.15;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
      initDots();
    }

    function initDots() {
      if (!canvas) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const dots: Dot[] = [];

      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          dots.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            size: dotSize + Math.random() * 0.5,
            opacity: 0.12 + Math.random() * 0.08,
          });
        }
      }
      dotsRef.current = dots;
    }

    function animate() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const isLight = document.documentElement.classList.contains("light");
      const mouse = mouseRef.current;

      for (const dot of dotsRef.current) {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          dot.vx -= (dx / dist) * force * 2;
          dot.vy -= (dy / dist) * force * 2;
        }

        dot.vx += (dot.baseX - dot.x) * returnSpeed;
        dot.vy += (dot.baseY - dot.y) * returnSpeed;
        dot.vx *= 0.92;
        dot.vy *= 0.92;

        dot.vx += (Math.random() - 0.5) * driftSpeed;
        dot.vy += (Math.random() - 0.5) * driftSpeed;

        dot.x += dot.vx;
        dot.y += dot.vy;

        const alpha = isLight ? dot.opacity * 0.7 : dot.opacity * 0.02;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(0, 0, 0, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    function handleMouse(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function handleLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    resize();
    frameRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
