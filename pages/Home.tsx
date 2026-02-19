
import React, { useState, useMemo, useEffect } from 'react';
import { Note, AppView, NoteType, Settings } from '../types';
import { isQuietHoursActive } from '../geminiService';

interface HomeProps {
  notes: Note[];
  settings: Settings;
  onSelectNote: (note: Note) => void;
  onAddNote: (type: Note['type']) => void;
  onOpenSettings: () => void;
  onChangeView: (view: AppView) => void;
}

type DateFilter = 'all' | 'today' | 'week' | 'month';

const Home: React.FC<HomeProps> = ({ notes, settings, onSelectNote, onAddNote, onOpenSettings, onChangeView }) => {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | NoteType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showDateOptions, setShowDateOptions] = useState(false);
  const [isQuiet, setIsQuiet] = useState(false);

  useEffect(() => {
    const checkQuiet = () => setIsQuiet(isQuietHoursActive(settings));
    checkQuiet();
    const interval = setInterval(checkQuiet, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [settings]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                           n.content.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (dateFilter !== 'all') {
        const noteDate = new Date(n.createdAt);
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        if (dateFilter === 'today') {
          if (noteDate < startOfDay) return false;
        } else if (dateFilter === 'week') {
          const startOfWeek = new Date(now.setDate(now.getDate() - 7));
          if (noteDate < startOfWeek) return false;
        } else if (dateFilter === 'month') {
          const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
          if (noteDate < startOfMonth) return false;
        }
      }
      return true;
    });
  }, [notes, search, typeFilter, dateFilter]);

  const typeOptions: { label: string; value: 'all' | NoteType; icon: string }[] = [
    { label: 'All', value: 'all', icon: 'apps' },
    { label: 'Text', value: 'text', icon: 'description' },
    { label: 'Voice', value: 'voice', icon: 'mic' },
    { label: 'Scan', value: 'scan', icon: 'document_scanner' },
  ];

  const dateOptions: { label: string; value: DateFilter }[] = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Past 7 Days', value: 'week' },
    { label: 'Past 30 Days', value: 'month' },
  ];

  return (
    <div className="h-full flex flex-col relative bg-white dark:bg-background-dark">
      <header className="flex items-center justify-between px-6 py-6 sticky top-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">ThinkBack</h1>
            {isQuiet && (
              <span className="material-symbols-outlined text-accent-blue text-lg fill-1 animate-pulse">dark_mode</span>
            )}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {isQuiet ? 'Quiet Mode Active' : 'Your Digital Mind'}
          </p>
        </div>
        <button 
          onClick={onOpenSettings}
          className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-600">settings</span>
        </button>
      </header>

      <main className="flex-1 px-6 overflow-y-auto hide-scrollbar pb-32">
        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 text-sm"
                placeholder="Search your memories..."
              />
            </div>
            <button 
              onClick={() => setShowDateOptions(!showDateOptions)}
              className={`size-14 rounded-2xl flex items-center justify-center transition-all ${
                dateFilter !== 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
              }`}
            >
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
          </div>

          {showDateOptions && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {dateOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDateFilter(opt.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    dateFilter === opt.value 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {typeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all border ${
                  typeFilter === opt.value
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                <span className="text-xs font-bold uppercase tracking-widest">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {search || typeFilter !== 'all' || dateFilter !== 'all' ? 'Search Results' : 'Recent Notes'}
            </h2>
            <span className="text-[10px] font-bold text-slate-300">{filteredNotes.length} Found</span>
          </div>

          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-4 opacity-40">
                <span className="material-symbols-outlined text-6xl">search_off</span>
                <p className="text-sm italic font-medium">No memories match your criteria</p>
                <button 
                  onClick={() => { setSearch(''); setTypeFilter('all'); setDateFilter('all'); }}
                  className="text-xs text-primary font-bold uppercase underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 ${
                    note.type === 'voice' ? 'bg-primary/10 text-primary' : 
                    note.type === 'scan' ? 'bg-accent-blue/10 text-accent-blue' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{
                      note.type === 'voice' ? 'mic' : note.type === 'scan' ? 'document_scanner' : 'description'
                    }</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-base">
                      {note.title || (note.type === 'voice' ? 'Voice Memory' : 'New Note')}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="size-1 rounded-full bg-slate-300" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{note.type}</p>
                    </div>
                  </div>
                  {note.summary && (
                    <div className="px-2 py-1 rounded-lg text-[9px] font-black bg-primary text-white uppercase tracking-tighter">AI</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <button 
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-24 right-6 size-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 px-8 py-4 pb-8 flex justify-around items-center z-10">
        <button onClick={() => onChangeView('home')} className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => onChangeView('library')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">library_books</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Library</span>
        </button>
        <button onClick={() => onChangeView('profile')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>

      {/* Add Note Bottom Sheet */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAddSheet(false)}
          />
          <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[40px] p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8" />
            <h2 className="text-xl font-bold mb-8 text-center">Add Note</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-10 px-4">
              <button 
                onClick={() => onAddNote('text')}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 transition-colors group"
              >
                <div className="size-14 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-500 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">edit_note</span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Text</span>
              </button>
              <button 
                onClick={() => onAddNote('voice')}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 transition-colors group"
              >
                <div className="size-14 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-500 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">mic</span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Voice</span>
              </button>
              <button 
                onClick={() => onAddNote('scan')}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 transition-colors group"
              >
                <div className="size-14 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-500 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">document_scanner</span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Scan</span>
              </button>
            </div>

            <button 
              onClick={() => setShowAddSheet(false)}
              className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
