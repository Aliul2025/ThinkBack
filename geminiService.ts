
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Settings } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Checks if the current time falls within the defined Quiet Hours.
 * Supports ranges that cross midnight (e.g., 23:00 to 07:00).
 */
export const isQuietHoursActive = (settings: Settings): boolean => {
  if (!settings.quietHoursEnabled) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes < endMinutes) {
    // Normal range (e.g., 09:00 to 17:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Crossing midnight (e.g., 22:00 to 06:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
};

export const getVoiceName = (settings: Settings): string => {
  const { voiceStyle, voiceGender } = settings;
  if (voiceGender === 'Female') {
    switch (voiceStyle) {
      case 'Energetic': return 'Kore';
      case 'Friendly': return 'Kore';
      case 'Boss': return 'Kore';
      case 'Calm':
      default: return 'Zephyr';
    }
  } else {
    switch (voiceStyle) {
      case 'Energetic': return 'Fenrir';
      case 'Friendly': return 'Puck';
      case 'Boss': return 'Fenrir';
      case 'Calm':
      default: return 'Charon';
    }
  }
};

export const generateNoteSummary = async (content: string, assistantName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following note content into a single, elegant sentence.
      Act as '${assistantName}'.
      Content: "${content}"`,
    });
    return response.text?.trim() || "No summary available.";
  } catch (error) {
    return "Could not generate summary.";
  }
};

export const parseReminderTime = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert the following natural language time reference into a clean, human-readable date and time string (e.g., "Monday, Oct 24 at 10:00 AM"). If the input is vague, provide the best guess.
      Input: "${input}"`,
    });
    return response.text?.trim() || input;
  } catch (error) {
    console.error("Time parsing error:", error);
    return input;
  }
};

export const detectReminders = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify reminders. Return JSON with 'hasReminder' (bool) and 'suggestedTime' (string).
      Content: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasReminder: { type: Type.BOOLEAN },
            suggestedTime: { type: Type.STRING },
          },
          required: ["hasReminder"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { hasReminder: false };
  }
};

export const extractTextFromImage = async (base64Data: string, mode: 'scan' | 'photo' | 'card' = 'scan') => {
  let prompt = "";
  if (mode === 'scan') {
    prompt = "Extract all text from this document accurately. Preserve layout and hierarchy.";
  } else if (mode === 'card') {
    prompt = "Extract contact information from this business card. Return a clean list: Name, Title, Company, Phone, Email, and Website if present.";
  } else {
    prompt = "Describe this photo in detail. Identify the main subjects, setting, and mood. Provide a poetic but clear description of what is happening in the scene.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
    });
    return response.text?.trim() || "No content extracted.";
  } catch (error) {
    console.error("Scanning Error:", error);
    return "Error occurred while processing the capture.";
  }
};

/**
 * Generates a localized greeting or phrase based on current settings
 */
export const generateLocalizedPhrase = async (baseText: string, targetLanguage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following phrase into ${targetLanguage}. 
      Keep the tone professional yet helpful. 
      Respond ONLY with the translated text.
      Phrase: "${baseText}"`,
    });
    return response.text?.trim() || baseText;
  } catch (error) {
    console.error("Translation error:", error);
    return baseText;
  }
};

export const testVoiceOutput = async (text: string, voiceName: string, volume: number = 80, speed: number = 1.0, ignoreQuietMode: boolean = false) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data");
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume / 100;
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speed;
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    source.start();
    return true;
  } catch (error) {
    return false;
  }
};
