
export type NoteType = 'text' | 'voice' | 'scan';

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: NoteType;
  createdAt: string;
  modifiedAt: string;
  isFavorite?: boolean;
  hasReminder?: boolean;
  reminderTime?: string;
  isCompleted?: boolean;
  tags?: string[];
}

export interface Settings {
  userName: string;
  userAvatarSeed: string;
  assistantName: string;
  voiceStyle: 'Calm' | 'Energetic' | 'Friendly' | 'Boss';
  voiceGender: 'Male' | 'Female';
  language: string;
  theme: 'light' | 'dark' | 'system';
  voiceStylePresets: Record<string, string>; // Keys: {StyleId}_{Lang}, intro_{Lang}, greeting_{Lang}, nudge_{Lang}, reminder_{Lang}
  speechLanguage: string;
  speechLanguageMode: 'auto' | 'app' | 'manual';
  autoDetectReminders: boolean;
  reminderSensitivity: 'Basic' | 'Smart' | 'Deep';
  askBeforeReminder: boolean;
  voiceReminders: boolean;
  voiceVolumeStyle: 'system' | 'soft' | 'loud' | 'boost';
  voiceVolume: number; // 0 to 100
  voiceSpeed: number; // 0.5 to 2.0
  voiceFrequency: 'Minimal' | 'Normal' | 'Frequent';
  dailyCheckIn: boolean;
  dailyCheckInTime: string;
  speakCheckInAloud: boolean;
  ideaRevival: boolean;
  ideaRevivalFrequency: 'Weekly' | 'Twice a week' | 'Monthly';
  maxNudgesPerWeek: number;
  biometricEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  cloudBackupEnabled: boolean;
  autoSyncNotes: boolean;
  wifiOnlySync: boolean;
  userEmail: string;
}

export type AppView = 
  | 'onboarding' 
  | 'home' 
  | 'editor' 
  | 'detail' 
  | 'voice' 
  | 'scan' 
  | 'settings' 
  | 'library' 
  | 'profile' 
  | 'language-picker' 
  | 'speech-language-picker'
  | 'theme-picker'
  | 'about'
  | 'privacy'
  | 'daily-checkin'
  | 'quiet-hours'
  | 'reminders'
  | 'search'
  | 'idea-revival'
  | 'backup-sync'
  | 'auto-reminder-detection'
  | 'voice-style'
  | 'assistant-name'
  | 'voice-reminders'
  | 'voice-gender'
  | 'voice-control';
