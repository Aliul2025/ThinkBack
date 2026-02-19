
import React, { useState, useMemo } from 'react';
import { Note, AppView } from '../types';

interface SearchProps {
  notes: Note[];
  onSelectNote: (n: Note) => void;
  onBack: () => void;
  onChangeView: (v: AppView) => void;
}

const Search: React.FC<SearchProps> = ({ notes, onSelectNote, onBack, onChangeView }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(['Meeting notes from Tuesday', 'Ideas for app design', 'Vacation itinerary 2024']);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return notes.filter(n => 
      n.title.toLowerCase().includes(query.toLowerCase()) || 
      n.content.toLowerCase().includes(query.toLowerCase())
    );
  }, [notes, query]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="text-primary font-bold">{part}</span> 
        : part
    );
  };

  const handleSelectResult = (note: Note) => {
    if (query && !history.includes(query)) {
      setHistory(prev => [query, ...prev.slice(0, 4)]);
    }
    onSelectNote(note);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in fade-in duration-300">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center p-2 rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xl">search</span>
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-primary/5 border-none rounded-2xl py-3 pl-10 pr-10 focus:ring-2 focus:ring-primary text-sm font-medium"
              placeholder="Search notes, ideas, reminders..."
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {!query.trim() ? (
          <div className="px-6 py-8">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Recent Searches</h2>
            <div className="space-y-4">
              {history.map(s => (
                <button 
                  key={s} 
                  onClick={() => setQuery(s)}
                  className="flex items-center gap-4 w-full text-left group"
                >
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">history</span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">{results.length} Results found</p>
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                  <p className="italic">No memories matching "{query}"</p>
                </div>
              ) : (
                results.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => handleSelectResult(note)}
                    className={`p-5 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-primary/20 cursor-pointer transition-all ${note.isCompleted ? 'opacity-50' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0 size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">{note.type === 'voice' ? 'mic' : note.type === 'scan' ? 'image' : 'description'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{highlightText(note.title || 'Untitled Memory', query)}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {highlightText(note.content, query)}
                        </p>
                        {note.hasReminder && (
                          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                            <span className="material-symbols-outlined text-xs">notifications_active</span>
                            Reminder set
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 py-4 pb-8 flex justify-around items-center z-10">
        <button onClick={() => onChangeView('home')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => onChangeView('reminders')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">alarm</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Alerts</span>
        </button>
        <button onClick={() => onChangeView('search')} className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">search</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
        </button>
        <button onClick={() => onChangeView('profile')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Search;
