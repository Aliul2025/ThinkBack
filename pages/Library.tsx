
import React, { useState } from 'react';
import { Note, AppView, NoteType } from '../types';

interface LibraryProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onChangeView: (view: AppView) => void;
}

const Library: React.FC<LibraryProps> = ({ notes, onSelectNote, onChangeView }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | NoteType>('all');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const filteredNotes = notes.filter(n => activeFilter === 'all' || n.type === activeFilter);

  const categories: { label: string; value: 'all' | NoteType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Voice', value: 'voice' },
    { label: 'Scans', value: 'scan' },
    { label: 'Text', value: 'text' },
  ];

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark">
      <header className="px-6 pt-12 pb-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-background-dark">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Library</h1>
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-medium text-slate-400">Browsing {notes.length} curated memories</p>
        </div>
      </header>

      <div className="px-6 py-4 flex gap-2 overflow-x-auto hide-scrollbar sticky top-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeFilter === cat.value
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-6 pb-28 overflow-y-auto mt-6">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <span className="material-symbols-outlined text-7xl mb-4 font-extralight">inventory_2</span>
            <p className="text-sm font-bold uppercase tracking-widest">No {activeFilter} memories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredNotes.map((note) => {
              const isExpanded = expandedNotes[note.id] || false;
              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="group relative flex flex-col p-6 rounded-[32px] bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Visual Accent */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    note.type === 'voice' ? 'bg-primary' : note.type === 'scan' ? 'bg-accent-blue' : 'bg-slate-300'
                  } opacity-20 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-xl flex items-center justify-center ${
                        note.type === 'voice' ? 'bg-primary/10 text-primary' : 
                        note.type === 'scan' ? 'bg-accent-blue/10 text-accent-blue' : 
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        <span className="material-symbols-outlined text-xl">
                          {note.type === 'voice' ? 'mic' : note.type === 'scan' ? 'document_scanner' : 'description'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate max-w-[200px]">
                          {note.title || 'Untitled Memory'}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-tighter text-slate-300">
                          {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    {note.summary && (
                      <button 
                        onClick={(e) => toggleExpand(e, note.id)}
                        className={`size-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary text-white shadow-lg' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                      >
                        <span className="material-symbols-outlined text-xl">{isExpanded ? 'subject' : 'auto_awesome'}</span>
                      </button>
                    )}
                  </div>

                  <div className="relative min-h-[60px]">
                    {!isExpanded && note.summary ? (
                      <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary text-[14px] fill-1">psychology</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-primary">AI Remembrance</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed font-medium">
                          "{note.summary}"
                        </p>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        {isExpanded && note.summary && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-slate-400 text-[14px]">notes</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Full Transcript</span>
                          </div>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {note.content || 'No content available.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                        {note.type}
                      </span>
                      {note.tags?.slice(0, 1).map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 py-4 pb-8 flex justify-around items-center z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => onChangeView('home')} className="flex flex-col items-center gap-1 text-slate-300 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => onChangeView('library')} className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">library_books</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Library</span>
        </button>
        <button onClick={() => onChangeView('profile')} className="flex flex-col items-center gap-1 text-slate-300 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Library;
