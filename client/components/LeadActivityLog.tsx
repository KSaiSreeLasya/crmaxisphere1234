import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Calendar } from "lucide-react";

interface Note {
  id: string;
  lead_id: string;
  note_text: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadActivityLogProps {
  leadId: string;
  initialNote?: string;
  onNoteAdded?: () => void;
}

export default function LeadActivityLog({
  leadId,
  initialNote,
  onNoteAdded,
}: LeadActivityLogProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lead_notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to load activity log",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNote.trim()) {
      toast({
        title: "Error",
        description: "Note cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("lead_notes").insert({
        lead_id: leadId,
        note_text: newNote.trim(),
      });

      if (error) throw error;

      setNewNote("");
      await fetchNotes();

      toast({
        title: "Success",
        description: "Note added successfully",
      });

      onNoteAdded?.();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading activity log...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="space-y-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          disabled={submitting}
          className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={submitting || !newNote.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-opacity"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Saving..." : "Add Note"}
        </button>
      </form>

      {/* Activity Log Timeline */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground">No notes yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add a note to get started
            </p>
          </div>
        ) : (
          notes.map((note, index) => (
            <div key={note.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full" />
                {index < notes.length - 1 && (
                  <div className="w-0.5 h-12 bg-border mt-2" />
                )}
              </div>

              {/* Note content */}
              <div className="flex-1 pb-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(note.created_at)}
                  </div>
                  <p className="text-foreground whitespace-pre-wrap break-words">
                    {note.note_text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
