"use client";

import { useEffect, useRef } from "react";

type Obstacle = { x: number; w: number; h: number };

type GameState = {
  running: boolean;
  started: boolean;
  gameOver: boolean;
  score: number;
  speed: number;
  groundX: number;
  dinoY: number;
  dinoVy: number;
  onGround: boolean;
  obstacles: Obstacle[];
  spawnTimer: number;
  anim: number;
};

const GRAVITY = 0.65;
const JUMP_V = -11.5;
const GROUND_Y = 0.78; // fraction of canvas height
const DINO_W = 44;
const DINO_H = 48;

function createState(): GameState {
  return {
    running: false,
    started: false,
    gameOver: false,
    score: 0,
    speed: 6,
    groundX: 0,
    dinoY: 0,
    dinoVy: 0,
    onGround: true,
    obstacles: [],
    spawnTimer: 90,
    anim: 0,
  };
}

function drawDino(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  dead: boolean
) {
  ctx.fillStyle = "#535353";
  // body
  ctx.fillRect(x + 14, y + 14, 22, 22);
  // head
  ctx.fillRect(x + 28, y + 4, 16, 14);
  ctx.fillRect(x + 40, y + 10, 4, 4);
  // eye
  ctx.fillStyle = dead ? "#535353" : "#f7f7f7";
  ctx.fillRect(x + 38, y + 7, 3, 3);
  if (dead) {
    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 37, y + 6);
    ctx.lineTo(x + 41, y + 10);
    ctx.moveTo(x + 41, y + 6);
    ctx.lineTo(x + 37, y + 10);
    ctx.stroke();
  }
  ctx.fillStyle = "#535353";
  // legs
  const leg = Math.floor(frame / 6) % 2;
  if (dead) {
    ctx.fillRect(x + 16, y + 36, 6, 12);
    ctx.fillRect(x + 28, y + 36, 6, 12);
  } else if (leg === 0) {
    ctx.fillRect(x + 16, y + 36, 6, 12);
    ctx.fillRect(x + 28, y + 36, 6, 8);
  } else {
    ctx.fillRect(x + 16, y + 36, 6, 8);
    ctx.fillRect(x + 28, y + 36, 6, 12);
  }
  // tail
  ctx.fillRect(x + 4, y + 20, 12, 6);
  ctx.fillRect(x + 2, y + 16, 6, 6);
}

function drawCactus(ctx: CanvasRenderingContext2D, x: number, ground: number, w: number, h: number) {
  ctx.fillStyle = "#535353";
  const baseX = x + w * 0.35;
  const stemW = Math.max(8, w * 0.3);
  ctx.fillRect(baseX, ground - h, stemW, h);
  if (h > 36) {
    ctx.fillRect(baseX - 10, ground - h * 0.55, 10, 6);
    ctx.fillRect(baseX - 12, ground - h * 0.55, 6, h * 0.28);
    ctx.fillRect(baseX + stemW, ground - h * 0.7, 10, 6);
    ctx.fillRect(baseX + stemW + 4, ground - h * 0.7, 6, h * 0.22);
  }
}

export function DinoGameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createState());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const resize = () => {
      const w = parent?.clientWidth ?? 700;
      const h = parent?.clientHeight ?? 360;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (parent) ro.observe(parent);

    const jump = () => {
      const s = stateRef.current;
      if (!s.started || s.gameOver) {
        stateRef.current = createState();
        stateRef.current.started = true;
        stateRef.current.running = true;
        return;
      }
      if (s.onGround) {
        s.dinoVy = JUMP_V;
        s.onGround = false;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "ArrowUp") return;
      e.preventDefault();
      e.stopPropagation();
      jump();
    };

    const onPointer = (e: PointerEvent) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);

    const loop = () => {
      const s = stateRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const ground = h * GROUND_Y;
      const dinoX = 48;

      if (s.running && !s.gameOver) {
        s.anim += 1;
        s.score += 0.15;
        s.speed = Math.min(14, 6 + s.score / 120);
        s.groundX = (s.groundX - s.speed) % 24;

        if (!s.onGround) {
          s.dinoVy += GRAVITY;
          s.dinoY += s.dinoVy;
          if (s.dinoY >= 0) {
            s.dinoY = 0;
            s.dinoVy = 0;
            s.onGround = true;
          }
        }

        s.spawnTimer -= 1;
        if (s.spawnTimer <= 0) {
          const tall = Math.random() > 0.55;
          s.obstacles.push({
            x: w + 20,
            w: tall ? 28 : 18,
            h: tall ? 48 + Math.random() * 16 : 28 + Math.random() * 10,
          });
          s.spawnTimer = 55 + Math.random() * 70 - s.speed * 2;
        }

        for (const o of s.obstacles) o.x -= s.speed;
        s.obstacles = s.obstacles.filter((o) => o.x + o.w > -10);

        const dinoTop = ground - DINO_H + s.dinoY;
        const dinoBox = {
          x: dinoX + 6,
          y: dinoTop + 4,
          w: DINO_W - 10,
          h: DINO_H - 8,
        };
        for (const o of s.obstacles) {
          const ob = {
            x: o.x + 2,
            y: ground - o.h,
            w: o.w - 4,
            h: o.h - 2,
          };
          if (
            dinoBox.x < ob.x + ob.w &&
            dinoBox.x + dinoBox.w > ob.x &&
            dinoBox.y < ob.y + ob.h &&
            dinoBox.y + dinoBox.h > ob.y
          ) {
            s.gameOver = true;
            s.running = false;
          }
        }
      }

      // draw
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "#535353";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, ground);
      ctx.lineTo(w, ground);
      ctx.stroke();

      // ground dashes
      ctx.fillStyle = "#535353";
      for (let i = s.groundX; i < w + 24; i += 24) {
        ctx.fillRect(i, ground + 4, 10, 2);
      }

      for (const o of s.obstacles) {
        drawCactus(ctx, o.x, ground, o.w, o.h);
      }

      const dinoTop = ground - DINO_H + s.dinoY;
      drawDino(ctx, dinoX, dinoTop, s.onGround && s.running ? s.anim : 0, s.gameOver);

      ctx.fillStyle = "#535353";
      ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.floor(s.score)).padStart(5, "0"), w - 16, 28);

      ctx.textAlign = "center";
      ctx.font = "600 15px system-ui, sans-serif";
      if (!s.started) {
        ctx.fillText("Press Space to start", w / 2, ground - 80);
      } else if (s.gameOver) {
        ctx.fillText("Game Over — Space to retry", w / 2, ground - 80);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#f7f7f7]">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}
