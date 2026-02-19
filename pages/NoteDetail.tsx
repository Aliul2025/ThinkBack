
import React, { useState } from 'react';
import { Note, Settings } from '../types';
import { testVoiceOutput, getVoiceName, parseReminderTime, isQuietHoursActive } from '../geminiService';

interface NoteDetailProps {
  note: Note;
  settings: Settings;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (note: Note) => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ note, settings, onBack, onEdit, onDelete, onUpdate }) => {
  const [reminderSet, setReminderSet] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleInput, setRescheduleInput] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  // Manual Picker State
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');

  const handleSetReminder = async (time?: string) => {
    const finalTime = time || note.reminderTime || 'later today';
    
    const updatedNote = { 
      ...note, 
      hasReminder: true, 
      reminderTime: finalTime 
    };
    
    onUpdate(updatedNote);
    setReminderSet(true);
    setShowReschedule(false);

    if (settings.voiceReminders && !isQuietHoursActive(settings)) {
      const voiceName = getVoiceName(settings);
      const text = `Remembrance confirmed. I will alert you at ${finalTime} for your note: ${note.title}.`;
      await testVoiceOutput(text, voiceName);
    }
  };

  const handleMarkDone = async () => {
    const isCompleted = !note.isCompleted;
    onUpdate({ ...note, isCompleted });
    
    if (isCompleted && !isQuietHoursActive(settings)) {
      const voiceName = getVoiceName(settings);
      await testVoiceOutput(`Task completed. Excellent work.`, voiceName);
    }
    
    onBack();
  };

  const handleCustomReschedule = async () => {
    if (!rescheduleInput.trim()) return;
    setIsRescheduling(true);
    
    const parsed = await parseReminderTime(rescheduleInput);
    await handleSetReminder(parsed);
    
    setIsRescheduling(false);
    setRescheduleInput('');
  };

  const handleManualConfirm = async () => {
    if (!manualDate || !manualTime) return;
    
    setIsRescheduling(true);
    
    const dateObj = new Date(`${manualDate}T${manualTime}`);
    const formatted = dateObj.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    await handleSetReminder(formatted);
    setIsRescheduling(false);
    setManualDate('');
    setManualTime('');
  };

  const reschedulePresets = [
    { label: 'Tomorrow', value: 'Tomorrow morning' },
    { label: 'This Weekend', value: 'Saturday morning' },
    { label: 'Next Week', value: 'Next Monday at 9:00 AM' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-background-dark">
      <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-sm font-bold tracking-tight">Memory Archive</h1>
        <div className="flex gap-1">
          <button onClick={onEdit} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600">
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button onClick={onDelete} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600">
            <span className="material-symbols-outlined text-red-400">delete</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32">
        {note.summary && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl fill-1">psychology</span>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Insights</h2>
              </div>
              <p className="text-lg font-medium leading-relaxed italic text-slate-800 dark:text-slate-200">
                "{note.summary}"
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-sm">
                    {note.type === 'voice' ? 'mic' : note.type === 'scan' ? 'image' : 'description'}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-primary tracking-widest">
                    {note.type} Note
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-slate-400 text-sm">notes</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Captured Content</span>
          </div>
          <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm ${note.isCompleted ? 'opacity-50 grayscale' : ''}`}>
            <h3 className={`text-xl font-bold mb-4 ${note.isCompleted ? 'line-through' : ''}`}>{note.title || 'Untitled Memory'}</h3>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {note.content}
            </p>
          </div>
        </section>

        {(note.hasReminder || reminderSet) && (
          <section className={`p-5 rounded-3xl border flex items-center gap-4 transition-all duration-500 ${reminderSet ? 'bg-green-50 dark:bg-green-900/10 border-green-200 scale-[1.02]' : 'bg-primary/5 border-primary/10'}`}>
            <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${reminderSet ? 'bg-green-100 text-green-600 shadow-sm' : 'bg-primary/10 text-primary'}`}>
              <span className={`material-symbols-outlined fill-1 ${reminderSet ? 'animate-bounce' : ''}`}>
                {reminderSet ? 'check_circle' : 'notifications_active'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                {reminderSet ? 'Alert Programmed' : 'Suggested Reminder'}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{note.reminderTime || 'Later today'}</p>
            </div>
            {!reminderSet && (
              <button 
                onClick={() => handleSetReminder()}
                className="px-5 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Set
              </button>
            )}
          </section>
        )}

        <div className="pt-8 flex flex-col gap-3">
          <button 
            onClick={handleMarkDone} 
            className={`w-full h-16 ${note.isCompleted ? 'bg-slate-400' : 'bg-primary'} text-white font-bold rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all`}
          >
            <span className="material-symbols-outlined text-2xl">{note.isCompleted ? 'history' : 'check_circle'}</span>
            {note.isCompleted ? 'Move to Active' : 'Mark as Done'}
          </button>
          <button 
            onClick={() => setShowReschedule(true)}
            className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <span className="material-symbols-outlined text-2xl">calendar_today</span>
            Reschedule
          </button>
        </div>
      </main>

      <footer className="p-8 text-center opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Mind Stored: {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </footer>

      {/* Reschedule Sheet */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowReschedule(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[40px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 sticky top-0" />
            
            <h2 className="text-2xl font-bold mb-2 text-center">Reschedule Reminder</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">When should {settings.assistantName} remind you?</p>
            
            <div className="grid grid-cols-1 gap-3 mb-8">
              {reschedulePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleSetReminder(preset.value)}
                  className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-200">{preset.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{preset.value.split(' at ')[0]}</span>
                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                  </div>
                </button>
              ))}
            </div>

            {/* AI Natural Language Input */}
            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block px-1">AI Smart Entry</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary">auto_awesome</span>
                <input 
                  value={rescheduleInput}
                  onChange={(e) => setRescheduleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomReschedule()}
                  placeholder="e.g. 'Next Thursday at 5pm'..."
                  className="w-full h-16 pl-14 pr-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/20 transition-all font-medium text-slate-800 dark:text-slate-100"
                />
                {isRescheduling && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Manual Date & Time Picker */}
            <div className="mb-10 space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block px-1">Manual Selection</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">calendar_today</span>
                  <input 
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all appearance-none"
                  />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">schedule</span>
                  <input 
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all appearance-none"
                  />
                </div>
              </div>
              <button
                onClick={handleManualConfirm}
                disabled={!manualDate || !manualTime || isRescheduling}
                className="w-full h-14 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-2xl shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">event_available</span>
                Confirm Manual Time
              </button>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowReschedule(false)}
                className="flex-1 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
              >
                Close
              </button>
              <button 
                onClick={handleCustomReschedule}
                disabled={!rescheduleInput.trim() || isRescheduling}
                className="flex-[2] h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                AI Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetail;
