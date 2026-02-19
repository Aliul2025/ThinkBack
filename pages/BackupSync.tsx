
import React, { useState } from 'react';
import { Settings } from '../types';

interface BackupSyncProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const BackupSync: React.FC<BackupSyncProps> = ({ settings, onUpdate, onBack }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Default placeholder email check
  const isConnected = settings.userEmail && settings.userEmail !== 'user@example.com';

  const toggle = (key: keyof Settings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const handleBackupNow = () => {
    if (!isConnected) {
      setShowLoginModal(true);
      return;
    }
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      onUpdate({ ...settings, cloudBackupEnabled: true });
    }, 2000);
  };

  const handleRestore = () => {
    if (!isConnected) {
      setShowLoginModal(true);
      return;
    }
    setIsRestoring(true);
    setRestoreProgress(0);
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsRestoring(false), 800);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const simulateGoogleLogin = (email: string) => {
    setIsConnecting(true);
    setTimeout(() => {
      onUpdate({ 
        ...settings, 
        userEmail: email,
        cloudBackupEnabled: true 
      });
      setIsConnecting(false);
      setShowLoginModal(false);
      setShowEmailInput(false);
      setCustomEmail('');
    }, 1800);
  };

  const handleDisconnect = () => {
    onUpdate({ 
      ...settings, 
      userEmail: 'user@example.com',
      cloudBackupEnabled: false 
    });
  };

  const handleSwitchAccount = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 flex items-center px-4 h-16 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-4 text-lg font-bold tracking-tight">Backup & Sync</h1>
      </header>

      <main className="flex-1 px-6 py-6 space-y-8 overflow-y-auto pb-32">
        {/* Status Card */}
        <section className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] text-center space-y-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {isRestoring && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center p-8 z-10 animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-4xl text-accent-blue animate-bounce mb-4">cloud_download</span>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Restoring Memories...</p>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-accent-blue transition-all duration-300" style={{ width: `${restoreProgress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{restoreProgress}% complete</p>
            </div>
          )}

          <div className={`size-20 rounded-full flex items-center justify-center transition-all ${isBackingUp ? 'bg-primary/20 text-primary' : isConnected ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <span className={`material-symbols-outlined text-4xl fill-1 ${isBackingUp ? 'animate-spin' : ''}`}>
              {isBackingUp ? 'sync' : isConnected ? 'cloud_done' : 'cloud_off'}
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">
              {isBackingUp ? 'Syncing...' : isConnected ? 'Notes Protected' : 'Sync Disabled'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              {isConnected 
                ? `Last sync: Just now`
                : 'Connect Google to enable auto-backup'}
            </p>
          </div>
        </section>

        {/* Account Control */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase px-1">Google Account</h3>
          
          {isConnected ? (
            <div className="space-y-3">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${settings.userEmail}`} alt="Profile" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate">{settings.userEmail}</span>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Signed In</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSwitchAccount}
                    className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-accent-blue transition-colors border border-slate-100 dark:border-slate-700"
                    title="Switch Account"
                  >
                    <span className="material-symbols-outlined text-xl">switch_account</span>
                  </button>
                </div>
              </div>
              <button 
                onClick={handleDisconnect}
                className="w-full py-4 text-red-500 font-bold text-xs uppercase tracking-[0.2em] bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/10"
              >
                Disconnect Account
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full p-8 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] flex flex-col items-center gap-3 hover:border-accent-blue/40 group transition-all"
            >
              <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-accent-blue transition-colors">
                <span className="material-symbols-outlined text-3xl">account_circle</span>
              </div>
              <span className="text-sm font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Sign in with Google</span>
            </button>
          )}
        </section>

        {/* Sync Settings */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase px-1">Sync Preferences</h3>
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">Auto-sync notes</span>
                <span className="text-[10px] text-slate-400">Save changes instantly to cloud</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.autoSyncNotes} onChange={() => toggle('autoSyncNotes')} className="sr-only peer" />
                <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent-blue"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">Wi-Fi only sync</span>
                <span className="text-[10px] text-slate-400">Preserve your mobile data</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.wifiOnlySync} onChange={() => toggle('wifiOnlySync')} className="sr-only peer" />
                <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent-blue"></div>
              </label>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <button 
          onClick={handleBackupNow}
          disabled={isBackingUp}
          className="w-full py-4 bg-accent-blue text-white font-bold rounded-2xl shadow-xl shadow-accent-blue/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isBackingUp ? 'Backing Up...' : 'Sync All Memories'}
        </button>
        <button 
          onClick={handleRestore}
          disabled={isRestoring || !isConnected}
          className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30"
        >
          Download from Cloud
        </button>
      </footer>

      {/* Enhanced Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isConnecting && setShowLoginModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] p-8 overflow-hidden animate-in zoom-in duration-300 shadow-2xl">
            {isConnecting ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="size-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
                <div className="text-center space-y-1">
                  <p className="font-bold">Verifying Account...</p>
                  <p className="text-xs text-slate-400">Connecting to Google Secure API</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="size-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-3">
                    <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" className="w-full" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Google Login</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Choose an account for ThinkBack</p>
                </div>

                {!showEmailInput ? (
                  <div className="space-y-3 mb-8">
                    {[
                      { name: 'Alex Thompson', email: 'alex.t@gmail.com' },
                      { name: 'Startup Admin', email: 'admin@startup.io' }
                    ].filter(acc => acc.email !== settings.userEmail).map(acc => (
                      <button 
                        key={acc.email}
                        onClick={() => simulateGoogleLogin(acc.email)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 group"
                      >
                        <div className="size-10 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center font-bold text-sm group-hover:bg-accent-blue group-hover:text-white transition-colors">
                          {acc.name[0]}
                        </div>
                        <div className="flex flex-col text-left overflow-hidden">
                          <span className="font-bold text-sm truncate">{acc.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">{acc.email}</span>
                        </div>
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => setShowEmailInput(true)}
                      className="w-full py-4 text-accent-blue font-bold text-[10px] uppercase tracking-widest hover:bg-accent-blue/5 rounded-2xl transition-all border border-dashed border-accent-blue/20"
                    >
                      Use another account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 mb-8 animate-in slide-in-from-right duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email" 
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-accent-blue/40 font-medium"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowEmailInput(false)}
                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl text-xs uppercase"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => customEmail && simulateGoogleLogin(customEmail)}
                        disabled={!customEmail.includes('@')}
                        className="flex-[2] py-4 bg-accent-blue text-white font-bold rounded-2xl text-xs uppercase shadow-lg shadow-accent-blue/20 disabled:opacity-50"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-4 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupSync;
