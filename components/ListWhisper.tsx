"use client";

import { LIST_WHISPER } from "@/lib/constants";

export function ListWhisper() {
  return (
    <div className="list-whisper" role="status" aria-live="polite">
      <p>{LIST_WHISPER}</p>
    </div>
  );
}
