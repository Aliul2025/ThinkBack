
import React, { useState, useEffect } from 'react';
import { Note, Settings, AppView } from './types';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Editor from './pages/Editor';
import NoteDetail from './pages/NoteDetail';
import VoiceRecorder from './pages/VoiceRecorder';
import Scanner from './pages/Scanner';
import SettingsPage from './pages/Settings';
import Library from './pages/Library';
import Profile from './pages/Profile';
import LanguagePicker from './pages/LanguagePicker';
import SpeechLanguagePicker from './pages/SpeechLanguagePicker';
import ThemePicker from './pages/ThemePicker';
import About from './pages/About';
import Privacy from './pages/Privacy';
import DailyCheckIn from './pages/DailyCheckIn';
import QuietHours from './pages/QuietHours';
import Reminders from './pages/Reminders';
import Search from './pages/Search';
import IdeaRevival from './pages/IdeaRevival';
import BackupSync from './pages/BackupSync';
import AutoReminderDetection from './pages/AutoReminderDetection';
import VoiceStylePage from './pages/VoiceStyle';
import AssistantName from './pages/AssistantName';
import VoiceReminders from './pages/VoiceReminders';
import VoiceGenderPage from './pages/VoiceGender';
import VoiceControl from './pages/VoiceControl';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [voiceAppendMode, setVoiceAppendMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  
  const [settings, setSettings] = useState<Settings>({
    userName: 'Mindful User',
    userAvatarSeed: 'Mindful',
    assistantName: 'Maya',
    voiceStyle: 'Calm',
    voiceGender: 'Female',
    language: 'English — United States',
    theme: 'system',
    voiceStylePresets: {},
    speechLanguage: 'English',
    speechLanguageMode: 'auto',
    autoDetectReminders: true,
    reminderSensitivity: 'Smart',
    askBeforeReminder: true,
    voiceReminders: true,
    voiceVolumeStyle: 'system',
    voiceVolume: 80,
    voiceSpeed: 1.0,
    voiceFrequency: 'Normal',
    dailyCheckIn: true,
    dailyCheckInTime: '21:30',
    speakCheckInAloud: false,
    ideaRevival: true,
    ideaRevivalFrequency: 'Weekly',
    maxNudgesPerWeek: 2,
    biometricEnabled: false,
    quietHoursEnabled: true,
    quietHoursStart: '23:00',
    quietHoursEnd: '08:00',
    cloudBackupEnabled: false,
    autoSyncNotes: true,
    wifiOnlySync: true,
    userEmail: 'user@example.com',
  });

  // Handle Theme Application
  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      const theme = settings.theme;
      
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system changes if mode is 'system'
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('tb_notes');
    const savedSettings = localStorage.getItem('tb_settings');
    const onboarded = localStorage.getItem('tb_onboarded');

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (onboarded === 'true') {
      const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;
      if (parsedSettings?.biometricEnabled) {
        setIsLocked(true);
      }
      setView('home');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tb_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('tb_settings', JSON.stringify(settings));
  }, [settings]);

  const handleCompleteOnboarding = (name: string, gender: Settings['voiceGender'], language: string) => {
    setSettings(prev => ({ ...prev, assistantName: name, voiceGender: gender, language }));
    localStorage.setItem('tb_onboarded', 'true');
    setView('home');
  };

  const handleResetApp = () => {
    localStorage.removeItem('tb_notes');
    localStorage.removeItem('tb_settings');
    localStorage.removeItem('tb_onboarded');
    window.location.reload();
  };

  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const handleAddNote = (type: Note['type']) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      type,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      tags: [],
      isCompleted: false,
    };
    setActiveNote(newNote);
    setVoiceAppendMode(false);
    
    if (type === 'text') setView('editor');
    if (type === 'voice') setView('voice');
    if (type === 'scan') setView('scan');
  };

  const handleSaveNote = (updatedNote: Note) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === updatedNote.id);
      if (exists) {
        return prev.map(n => n.id === updatedNote.id ? updatedNote : n);
      }
      return [updatedNote, ...prev];
    });
    setActiveNote(updatedNote);
    setView('detail');
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    setActiveNote(updatedNote);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setView('home');
  };

  const handleVoiceComplete = (transcription: string) => {
    if (voiceAppendMode && activeNote) {
      const updatedNote = { ...activeNote, content: activeNote.content + (activeNote.content ? '\n\n' : '') + transcription };
      setActiveNote(updatedNote);
      setView('editor');
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: 'Voice Note ' + new Date().toLocaleTimeString(),
        content: transcription,
        type: 'voice',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        isCompleted: false,
      };
      handleSaveNote(newNote);
    }
  };

  const handleAuthenticate = () => {
    setAuthenticating(true);
    setTimeout(() => {
      setAuthenticating(false);
      setIsLocked(false);
    }, 1500);
  };

  const renderView = () => {
    if (isLocked) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-background-dark text-white p-8 animate-in fade-in duration-500">
          <div className="mb-12 text-center">
            <div className="bg-primary/20 size-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
              <span className="material-symbols-outlined text-primary text-4xl fill-1">lock</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">ThinkBack Locked</h1>
            <p className="text-slate-400 text-sm">Authentication required to continue</p>
          </div>
          <button onClick={handleAuthenticate} className={`relative size-32 rounded-full flex items-center justify-center transition-all ${authenticating ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}>
            <div className={`absolute inset-0 rounded-full border-2 border-primary/20 ${authenticating ? 'animate-ping' : ''}`} />
            <div className={`absolute inset-0 rounded-full border-2 border-primary/50 scale-110 ${authenticating ? 'animate-pulse' : ''}`} />
            <div className="size-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
              <span className={`material-symbols-outlined text-5xl text-primary transition-all ${authenticating ? 'opacity-50' : ''}`}>fingerprint</span>
            </div>
          </button>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">{authenticating ? 'Scanning...' : 'Tap to Authenticate'}</p>
        </div>
      );
    }

    switch (view) {
      case 'onboarding':
        return <Onboarding onComplete={handleCompleteOnboarding} />;
      case 'home':
        return <Home notes={notes} settings={settings} onSelectNote={(note) => { setActiveNote(note); setView('detail'); }} onAddNote={handleAddNote} onOpenSettings={() => setView('settings')} onChangeView={setView} />;
      case 'library':
        return <Library notes={notes} onSelectNote={(note) => { setActiveNote(note); setView('detail'); }} onChangeView={setView} />;
      case 'profile':
        return <Profile settings={settings} notes={notes} onChangeView={setView} onUpdateSettings={handleUpdateSettings} onOpenSettings={() => setView('settings')} onLock={() => setIsLocked(true)} onReset={handleResetApp} />;
      case 'editor':
        return <Editor note={activeNote!} settings={settings} onSave={handleSaveNote} onBack={() => setView('home')} onVoiceInput={() => { setVoiceAppendMode(true); setView('voice'); }} onOpenScanner={() => setView('scan')} />;
      case 'detail':
        return <NoteDetail note={activeNote!} settings={settings} onBack={() => setView('home')} onEdit={() => setView('editor')} onDelete={() => handleDeleteNote(activeNote!.id)} onUpdate={handleUpdateNote} />;
      case 'voice':
        return <VoiceRecorder onComplete={handleVoiceComplete} onCancel={() => setView(voiceAppendMode ? 'editor' : 'home')} settings={settings} />;
      case 'scan':
        return <Scanner onCapture={(content) => handleSaveNote({ ...activeNote!, content, type: 'scan' })} onCancel={() => setView('home')} />;
      case 'settings':
        return <SettingsPage settings={settings} onUpdate={setSettings} onBack={() => setView('home')} onChangeView={setView} />;
      case 'language-picker':
        return <LanguagePicker currentLanguage={settings.language} onSelect={(lang) => { setSettings(s => ({ ...s, language: lang })); setView('settings'); }} onBack={() => setView('settings')} />;
      case 'speech-language-picker':
        return <SpeechLanguagePicker settings={settings} onUpdate={(s) => { setSettings(s); setView('settings'); }} onBack={() => setView('settings')} />;
      case 'theme-picker':
        return <ThemePicker settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'about':
        return <About onBack={() => setView('settings')} />;
      case 'privacy':
        return <Privacy onBack={() => setView('settings')} settings={settings} notes={notes} onUpdate={setSettings} onReset={handleResetApp} />;
      case 'daily-checkin':
        return <DailyCheckIn settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'quiet-hours':
        return <QuietHours settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'reminders':
        return <Reminders notes={notes} onSelectNote={(note) => { setActiveNote(note); setView('detail'); }} onBack={() => setView('home')} onChangeView={setView} onAddNote={() => handleAddNote('text')} />;
      case 'search':
        return <Search notes={notes} onSelectNote={(note) => { setActiveNote(note); setView('detail'); }} onBack={() => setView('home')} onChangeView={setView} />;
      case 'idea-revival':
        return <IdeaRevival settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'backup-sync':
        return <BackupSync settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'auto-reminder-detection':
        return <AutoReminderDetection settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'voice-style':
        return <VoiceStylePage settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'assistant-name':
        return <AssistantName settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'voice-reminders':
        return <VoiceReminders settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'voice-gender':
        return <VoiceGenderPage settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      case 'voice-control':
        return <VoiceControl settings={settings} onUpdate={setSettings} onBack={() => setView('settings')} />;
      default:
        return <Home notes={notes} settings={settings} onSelectNote={setActiveNote} onAddNote={handleAddNote} onOpenSettings={() => setView('settings')} onChangeView={setView} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-md bg-white dark:bg-background-dark shadow-xl overflow-hidden relative flex flex-col">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
