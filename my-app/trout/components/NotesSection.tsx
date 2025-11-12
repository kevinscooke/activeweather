"use client";

import { LogEntry } from "@/types";

interface NotesSectionProps {
  notes: LogEntry[];
  onAddNote: (message: string) => void;
  readOnly?: boolean;
}

export default function NotesSection({ notes, onAddNote, readOnly = false }: NotesSectionProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("note") as string;
    if (message.trim()) {
      onAddNote(message.trim());
      e.currentTarget.reset();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Log</h2>
      
      {!readOnly && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            name="note"
            placeholder="Add a note or log entry..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Note
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No notes yet. Add your first note above.</p>
        ) : (
          notes
            .slice()
            .reverse()
            .map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 rounded-md p-3 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {note.date} at {note.timestamp} EST
                  </span>
                </div>
                <p className="text-sm text-gray-800">{note.message}</p>
                {note.itemQuestion && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Related to: {note.itemQuestion}
                  </p>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

