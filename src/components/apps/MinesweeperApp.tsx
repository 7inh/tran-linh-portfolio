"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { cn } from "@/lib/utils";

const ROWS = 9;
const COLS = 9;
const MINE_COUNT = 10;

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type Status = "ready" | "playing" | "won" | "lost";

type GameState = {
  board: Cell[][];
  status: Status;
  seconds: number;
  hit: { r: number; c: number } | null;
  pressed: boolean;
};

const NUMBER_COLORS = [
  "",
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#1d4ed8",
  "#991b1b",
  "#0f766e",
  "#111827",
  "#6b7280",
] as const;

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

function neighbors(r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push([nr, nc]);
    }
  }
  return out;
}

function cloneBoard(board: Cell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

/** Only the clicked cell is guaranteed safe (classic Minesweeper). */
function placeMines(board: Cell[][], safeR: number, safeC: number) {
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if ((r === safeR && c === safeC) || board[r][c].mine) continue;
    board[r][c].mine = true;
    placed++;
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) {
        board[r][c].adjacent = 0;
        continue;
      }
      board[r][c].adjacent = neighbors(r, c).filter(
        ([nr, nc]) => board[nr][nc].mine
      ).length;
    }
  }
}

function boardHasMines(board: Cell[][]) {
  return board.some((row) => row.some((cell) => cell.mine));
}

function floodReveal(board: Cell[][], r: number, c: number) {
  const stack: [number, number][] = [[r, c]];
  const seen = new Set<string>();

  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const key = `${cr},${cc}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const cell = board[cr][cc];
    if (cell.flagged) continue;
    cell.revealed = true;
    if (cell.mine || cell.adjacent > 0) continue;

    for (const [nr, nc] of neighbors(cr, cc)) {
      if (!board[nr][nc].revealed && !board[nr][nc].flagged) {
        stack.push([nr, nc]);
      }
    }
  }
}

function checkWin(board: Cell[][]) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].mine && !board[r][c].revealed) return false;
    }
  }
  return true;
}

function flagCount(board: Cell[][]) {
  return board.flat().filter((c) => c.flagged).length;
}

function initialState(): GameState {
  return {
    board: emptyBoard(),
    status: "ready",
    seconds: 0,
    hit: null,
    pressed: false,
  };
}

type Action =
  | { type: "reset" }
  | { type: "tick" }
  | { type: "press"; value: boolean }
  | { type: "reveal"; r: number; c: number }
  | { type: "flag"; r: number; c: number };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "reset":
      return initialState();
    case "tick":
      if (state.status !== "playing") return state;
      return { ...state, seconds: Math.min(999, state.seconds + 1) };
    case "press":
      return { ...state, pressed: action.value };
    case "reveal": {
      if (state.status === "won" || state.status === "lost") return state;
      const { r, c } = action;
      const board = cloneBoard(state.board);
      const cell = board[r][c];
      if (cell.revealed || cell.flagged) return state;

      if (!boardHasMines(board)) {
        placeMines(board, r, c);
      }

      if (board[r][c].mine) {
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (board[i][j].mine) board[i][j].revealed = true;
            // show mistaken flags
            if (board[i][j].flagged && !board[i][j].mine) {
              board[i][j].revealed = true;
            }
          }
        }
        board[r][c].revealed = true;
        return {
          ...state,
          board,
          status: "lost",
          hit: { r, c },
          pressed: false,
        };
      }

      floodReveal(board, r, c);

      if (checkWin(board)) {
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (board[i][j].mine) board[i][j].flagged = true;
          }
        }
        return {
          ...state,
          board,
          status: "won",
          pressed: false,
        };
      }

      return {
        ...state,
        board,
        status: "playing",
        pressed: false,
      };
    }
    case "flag": {
      if (state.status === "won" || state.status === "lost") return state;
      const { r, c } = action;
      const board = cloneBoard(state.board);
      const cell = board[r][c];
      if (cell.revealed) return state;
      cell.flagged = !cell.flagged;
      return {
        ...state,
        board,
        status: state.status === "ready" ? "playing" : state.status,
      };
    }
    default:
      return state;
  }
}

function pad3(n: number) {
  return String(Math.max(0, Math.min(999, n))).padStart(3, "0");
}

export function MinesweeperApp() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(id);
  }, [state.status]);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const remaining = MINE_COUNT - flagCount(state.board);
  const face =
    state.status === "won"
      ? "😎"
      : state.status === "lost"
        ? "😵"
        : state.pressed
          ? "😮"
          : "🙂";

  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#c0c0c0] p-4 select-none">
      <div className="w-full max-w-[340px] border-2 border-b-white border-r-white border-l-[#808080] border-t-[#808080] bg-[#c0c0c0] p-2 shadow-sm">
        <div className="mb-2 flex items-center justify-between border-2 border-b-[#808080] border-r-[#808080] border-l-white border-t-white bg-[#c0c0c0] px-2 py-1.5">
          <div className="min-w-[3.25rem] bg-black px-1.5 py-0.5 font-mono text-[18px] font-bold leading-none tracking-wider text-[#ff2020]">
            {pad3(remaining)}
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="flex size-8 items-center justify-center border-2 border-b-[#808080] border-r-[#808080] border-l-white border-t-white bg-[#c0c0c0] text-lg leading-none active:border-b-white active:border-r-white active:border-l-[#808080] active:border-t-[#808080]"
            aria-label="New game"
          >
            {face}
          </button>
          <div className="min-w-[3.25rem] bg-black px-1.5 py-0.5 text-right font-mono text-[18px] font-bold leading-none tracking-wider text-[#ff2020]">
            {pad3(state.seconds)}
          </div>
        </div>

        <div
          className="grid border-2 border-b-white border-r-white border-l-[#808080] border-t-[#808080] bg-[#c0c0c0] p-0.5"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {state.board.map((row, r) =>
            row.map((cell, c) => {
              const exploded =
                state.hit?.r === r && state.hit?.c === c && cell.mine && cell.revealed;
              const wrongFlag =
                state.status === "lost" && cell.flagged && !cell.mine;
              const label = cell.revealed
                ? cell.mine
                  ? "💣"
                  : wrongFlag
                    ? "❌"
                    : cell.adjacent > 0
                      ? String(cell.adjacent)
                      : ""
                : cell.flagged
                  ? "🚩"
                  : "";

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={state.status === "won" || state.status === "lost"}
                  aria-label={`Cell ${r + 1},${c + 1}`}
                  onMouseDown={(e) => {
                    if (e.button === 0 && !cell.revealed && !cell.flagged) {
                      dispatch({ type: "press", value: true });
                    }
                  }}
                  onMouseUp={() => dispatch({ type: "press", value: false })}
                  onMouseLeave={() => dispatch({ type: "press", value: false })}
                  onClick={(e) => {
                    if (longPressFired.current) {
                      longPressFired.current = false;
                      return;
                    }
                    // Ctrl/Cmd+click flags (macOS-friendly)
                    if (e.ctrlKey || e.metaKey) {
                      dispatch({ type: "flag", r, c });
                      return;
                    }
                    dispatch({ type: "reveal", r, c });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    dispatch({ type: "flag", r, c });
                  }}
                  onTouchStart={() => {
                    longPressFired.current = false;
                    clearLongPress();
                    longPressTimer.current = window.setTimeout(() => {
                      longPressFired.current = true;
                      dispatch({ type: "flag", r, c });
                    }, 450);
                  }}
                  onTouchEnd={clearLongPress}
                  onTouchCancel={clearLongPress}
                  className={cn(
                    "flex aspect-square items-center justify-center text-[13px] font-bold leading-none",
                    cell.revealed
                      ? cn(
                          "border border-[#808080] bg-[#c0c0c0]",
                          exploded && "bg-[#ef4444]"
                        )
                      : "border-2 border-b-[#808080] border-r-[#808080] border-l-white border-t-white bg-[#c0c0c0] active:border active:border-[#808080]"
                  )}
                  style={
                    cell.revealed && !cell.mine && cell.adjacent > 0
                      ? { color: NUMBER_COLORS[cell.adjacent] }
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-600">
        Click open · Right-click / Ctrl-click / long-press flag
      </p>
    </div>
  );
}
