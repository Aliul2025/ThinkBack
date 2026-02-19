
import React from 'react';
import { Note, AppView } from '../types';

interface RemindersProps {
  notes: Note[];
  onSelectNote: (n: Note) => void;
  onBack: () => void;
  onChangeView: (v: AppView) => void;
  onAddNote: () => void;
}

const Reminders: React.FC<RemindersProps> = ({ notes, onSelectNote, onBack, onChangeView, onAddNote }) => {
  const activeReminders = notes.filter(n => n.hasReminder && !n.isCompleted);
  const completedCount = notes.filter(n => n.isCompleted && n.hasReminder).length;

  const isToday = (timeStr?: string) => {
    if (!timeStr) return false;
    const lower = timeStr.toLowerCase();
    return lower.includes('today') || lower.includes('9:00 am') || lower.includes('5pm');
  };

  const todayReminders = activeReminders.filter(n => isToday(n.reminderTime));
  const upcomingReminders = activeReminders.filter(n => !isToday(n.reminderTime));

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-bottom duration-300">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Reminders</h1>
        </div>
        <button onClick={onAddNote} className="size-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <span className="material-symbols-outlined">add</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {activeReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 opacity-40">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-5xl">notification_add</span>
            </div>
            <h3 className="text-xl font-bold mb-2">No active reminders</h3>
            <p className="text-sm max-w-[240px] italic">Capture a thought and I'll help you remember it later.</p>
          </div>
        ) : (
          <>
            {todayReminders.length > 0 && (
              <section className="mb-10">
                <h2 className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  Today
                </h2>
                <div className="relative flex flex-col gap-6 pl-4 border-l-2 border-primary/10">
                  {todayReminders.map(note => (
                    <div key={note.id} onClick={() => onSelectNote(note)} className="relative group cursor-pointer">
                      <div className="absolute -left-[25px] top-1 size-4 rounded-full bg-primary border-4 border-white dark:border-background-dark z-10" />
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group-hover:border-primary/40 transition-all">
                        <h3 className="font-bold text-base">{note.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span> {note.reminderTime || 'Later today'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {upcomingReminders.length > 0 && (
              <section className="mb-10">
                <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                  Upcoming
                </h2>
                <div className="relative flex flex-col gap-6 pl-4 border-l-2 border-slate-100">
                  {upcomingReminders.map(note => (
                    <div key={note.id} onClick={() => onSelectNote(note)} className="relative group cursor-pointer">
                      <div className="absolute -left-[25px] top-1 size-4 rounded-full bg-slate-200 border-4 border-white dark:border-background-dark z-10" />
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group-hover:border-primary/40 transition-all">
                        <h3 className="font-bold text-base">{note.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_today</span> {note.reminderTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">task_alt</span>
              <span>Completed Reminders ({completedCount})</span>
            </div>
          </button>
        </section>
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 py-4 pb-8 flex justify-around items-center z-10">
        <button onClick={() => onChangeView('home')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => onChangeView('reminders')} className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">alarm</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Reminders</span>
        </button>
        <button onClick={() => onChangeView('search')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">search</span>
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

export default Reminders;
