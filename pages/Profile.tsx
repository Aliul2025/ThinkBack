
import React, { useState, useMemo } from 'react';
import { AppView, Settings, Note } from '../types';

interface ProfileProps {
  settings: Settings;
  notes: Note[];
  onChangeView: (view: AppView) => void;
  onUpdateSettings: (s: Settings) => void;
  onOpenSettings: () => void;
  onLock: () => void;
  onReset: () => void;
}

const Profile: React.FC<ProfileProps> = ({ settings, notes, onChangeView, onUpdateSettings, onOpenSettings, onLock, onReset }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(settings.userName || 'Mindful User');
  const [editedAvatarSeed, setEditedAvatarSeed] = useState(settings.userAvatarSeed || 'Mindful');

  // Stats calculations
  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayNotes = notes.filter(n => new Date(n.createdAt).getTime() >= today);
    const reminders = notes.filter(n => n.hasReminder);
    
    // Memory Usage calculation (simulated goal of 100 notes for v1)
    const goal = 100;
    const usagePercent = Math.min(Math.round((notes.length / goal) * 100), 100);

    return {
      total: notes.length,
      today: todayNotes.length,
      reminders: reminders.length,
      usage: usagePercent
    };
  }, [notes]);

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate cloud sync
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  const handleSaveProfile = () => {
    onUpdateSettings({
      ...settings,
      userName: editedName.trim() || 'Mindful User',
      userAvatarSeed: editedAvatarSeed.trim() || 'Mindful'
    });
    setIsEditing(false);
  };

  const shuffleAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setEditedAvatarSeed(randomSeed);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-background-dark overflow-y-auto pb-28 animate-in fade-in duration-500">
      <header className="px-6 pt-12 pb-8 bg-white dark:bg-slate-900 rounded-b-[40px] shadow-sm relative overflow-hidden transition-all duration-500">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-6">
            <div className={`size-28 rounded-[36px] bg-primary/10 border-2 transition-all ${isEditing ? 'border-primary ring-4 ring-primary/10' : 'border-primary/20'} p-2`}>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${isEditing ? editedAvatarSeed : settings.userAvatarSeed}`} 
                alt="User" 
                className="w-full h-full rounded-[28px] bg-white dark:bg-slate-800 object-cover"
              />
              {isEditing && (
                <button 
                  onClick={shuffleAvatar}
                  className="absolute -bottom-2 -right-2 size-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-xl">cached</span>
                </button>
              )}
            </div>
            {!isEditing && (
              <div className="absolute -bottom-1 -right-1 size-8 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                <div className="size-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="w-full px-4 mb-4">
              <input 
                autoFocus
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full h-12 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-center font-bold text-xl focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter your name"
                maxLength={20}
              />
              <div className="flex gap-2 justify-center mt-4">
                <button 
                  onClick={() => { setIsEditing(false); setEditedName(settings.userName); setEditedAvatarSeed(settings.userAvatarSeed); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                >
                  Save Profile
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{settings.userName || 'Mindful User'}</h1>
                <button onClick={() => setIsEditing(true)} className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                <span className="material-symbols-outlined text-xs text-primary fill-1">psychology</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{settings.assistantName} is active</span>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Memories</p>
          </div>
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
            <p className="text-2xl font-bold">{stats.reminders}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Reminders</p>
          </div>
        </div>
      </header>

      <main className="px-6 mt-8 space-y-8">
        {/* PRIVACY & SECURITY */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Privacy & Security</h2>
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center ${settings.biometricEnabled ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <span className="material-symbols-outlined fill-1">{settings.biometricEnabled ? 'verified_user' : 'shield'}</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Biometric Vault</p>
                  <p className="text-[10px] text-slate-400 font-medium">{settings.biometricEnabled ? 'Encryption Active' : 'Not configured'}</p>
                </div>
              </div>
              <button onClick={onOpenSettings} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Manage</button>
            </div>
            
            {settings.biometricEnabled ? (
              <button 
                onClick={onLock}
                className="w-full h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group"
              >
                <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">lock_open</span>
                <span className="text-xs font-bold uppercase tracking-widest">Lock Vault Now</span>
              </button>
            ) : (
              <p className="text-[10px] text-slate-400 italic text-center">Enable Biometric Vault in Settings to secure your memories.</p>
            )}
          </div>
        </section>

        {/* INSIGHTS */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Insights</h2>
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-end mb-4">
              <p className="text-sm font-semibold">Memory Usage</p>
              <p className="text-xs font-bold text-primary">{stats.usage}%</p>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${stats.usage}%` }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your digital mind is expanding. {settings.assistantName} has processed <span className="text-primary font-bold">{stats.today}</span> new memories today.
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="space-y-3 pb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Quick Actions</h2>
          
          <button onClick={onOpenSettings} className="w-full flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-primary/40 transition-all">
            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">settings_suggest</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">Assistant Tuning</p>
              <p className="text-[10px] text-slate-400 font-medium">Customize {settings.assistantName}'s behavior</p>
            </div>
            <span className="material-symbols-outlined text-slate-200">chevron_right</span>
          </button>

          <button 
            disabled={isSyncing}
            onClick={handleSync}
            className="w-full flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-accent-blue/40 transition-all disabled:opacity-50"
          >
            <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${
              isSyncing ? 'bg-accent-blue text-white animate-pulse' : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-accent-blue/10 group-hover:text-accent-blue'
            }`}>
              <span className={`material-symbols-outlined ${isSyncing ? 'animate-spin' : ''}`}>
                {isSyncing ? 'sync' : 'cloud_sync'}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">{isSyncing ? 'Syncing...' : 'Backup & Sync'}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {isSyncing ? 'Uploading memories securely' : 'Last sync: Just now'}
              </p>
            </div>
            {!isSyncing && <span className="material-symbols-outlined text-slate-200">chevron_right</span>}
          </button>

          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-red-500/40 transition-all"
          >
            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm text-red-500">Log out & Reset</p>
              <p className="text-[10px] text-slate-400 font-medium">Clear local session data</p>
            </div>
          </button>
        </section>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative w-full max-sm bg-white dark:bg-slate-900 rounded-[40px] p-8 text-center animate-in zoom-in duration-300 shadow-2xl">
            <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-red-500">logout</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Reset Session?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              This will log you out and permanently clear all memories and settings from this device.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onReset}
                className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                Clear Everything
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 py-4 pb-8 flex justify-around items-center z-10">
        <button onClick={() => onChangeView('home')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => onChangeView('library')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">library_books</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Library</span>
        </button>
        <button onClick={() => onChangeView('profile')} className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Profile;
