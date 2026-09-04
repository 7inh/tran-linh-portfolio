"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

const STORAGE_KEY = "portfolio-notes";

function createNote(title = "", body = ""): Note {
  return {
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
    title,
    body,
    updatedAt: Date.now(),
  };
}

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let initial: Note[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      initial = raw ? JSON.parse(raw) : [];
    } catch {
      initial = [];
    }
    if (!initial.length) {
      initial = [
        createNote(
          "Welcome",
          "This is a simple notes app. Click + to add a new note — everything is saved to your browser."
        ),
      ];
    }
    setNotes(initial);
    setActiveId(initial[0].id);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      /* ignore */
    }
  }, [notes, loaded]);

  const active = notes.find((n) => n.id === activeId) ?? null;
  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  const addNote = () => {
    const note = createNote();
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (activeId === id) {
        setActiveId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const updateActive = (patch: Partial<Pick<Note, "title" | "body">>) => {
    if (!active) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === active.id ? { ...n, ...patch, updatedAt: Date.now() } : n
      )
    );
  };

  return (
    <div className="flex h-full">
      <div className="flex w-[38%] min-w-[150px] flex-col border-r border-border bg-card/60 dark:bg-glass/40">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Notes
          </span>
          <button
            type="button"
            onClick={addNote}
            aria-label="New note"
            className="flex h-6 w-6 items-center justify-center rounded-md text-amber-600 transition hover:bg-amber-500/10 dark:text-amber-400"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {sorted.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => setActiveId(note.id)}
                className={cn(
                  "block w-full border-b border-border/60 px-3 py-2 text-left transition",
                  note.id === activeId ? "bg-amber-400/25" : "hover:bg-muted/60"
                )}
              >
                <div className="truncate text-[13px] font-medium text-foreground">
                  {note.title.trim() || "New Note"}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()}
                  {note.body.trim() ? ` · ${note.body.trim()}` : ""}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="flex items-center justify-end border-b border-border px-3 py-1.5">
              <button
                type="button"
                onClick={() => deleteNote(active.id)}
                aria-label="Delete note"
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              value={active.title}
              onChange={(e) => updateActive({ title: e.target.value })}
              placeholder="Title"
              className="border-b border-border bg-transparent px-4 py-2.5 text-[15px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            <textarea
              value={active.body}
              onChange={(e) => updateActive({ body: e.target.value })}
              placeholder="Start typing…"
              className="flex-1 resize-none bg-transparent px-4 py-3 text-[13.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-[13px] text-muted-foreground">
            No note selected. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
