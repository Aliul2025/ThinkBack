
import React, { useState, useEffect, useRef } from 'react';
import { Note, Settings } from '../types';
import { generateNoteSummary, detectReminders } from '../geminiService';

interface EditorProps {
  note: Note;
  settings: Settings;
  onSave: (note: Note) => void;
  onBack: () => void;
  onVoiceInput: () => void;
  onOpenScanner: () => void;
}

const Editor: React.FC<EditorProps> = ({ note, settings, onSave, onBack, onVoiceInput, onOpenScanner }) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
  }, [note]);

  const handleSave = async () => {
    if (!content.trim() && !title.trim()) {
      onBack();
      return;
    }

    setSaving(true);
    const summary = await generateNoteSummary(content, settings.assistantName);
    const reminderData = await detectReminders(content);

    const updatedNote: Note = {
      ...note,
      title: title || (content.split('\n')[0].slice(0, 30) || 'Untitled Note'),
      content,
      summary,
      hasReminder: reminderData.hasReminder,
      reminderTime: reminderData.suggestedTime,
      modifiedAt: new Date().toISOString(),
    };

    onSave(updatedNote);
    setSaving(false);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          {saving && <div className="size-2 rounded-full bg-primary animate-pulse" />}
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {saving ? 'AI Remembering...' : 'Draft Ready'}
          </span>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-wider hover:bg-primary/20 transition-all">
          Done
        </button>
      </header>

      <main className="flex-1 flex flex-col px-8 pt-4 pb-24 overflow-y-auto">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-3xl font-bold p-0 mb-6 placeholder:text-slate-200 dark:placeholder:text-slate-800"
          placeholder="Note Title"
        />
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full flex-1 bg-transparent border-none focus:ring-0 text-xl font-light p-0 resize-none leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700"
          placeholder={`Type your idea... ${settings.assistantName} will remember.`}
        />
      </main>

      <footer className="fixed bottom-0 left-0 w-full max-w-md p-6 pb-8 flex justify-between items-center bg-gradient-to-t from-white dark:from-background-dark via-white/80 dark:via-background-dark/80 to-transparent">
        <div className="flex gap-4">
          <button 
            onClick={onVoiceInput}
            className="size-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:animate-pulse">mic</span>
          </button>
          
          <button 
            onClick={onOpenScanner}
            className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"
          >
            <span className="material-symbols-outlined text-2xl">document_scanner</span>
          </button>
        </div>

        <button className="size-14 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </footer>
    </div>
  );
};

export default Editor;
