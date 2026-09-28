"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Language } from "@/data/models";

export interface SpeechState {
  speaking:         boolean;
  supported:        boolean;
  availableVoices:  string[];
  currentSentence:  number;   // index into sentences[]
  error:            string | null;
}

const LANG_BCP47: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  gu: "gu-IN",
};

export function useSpeech(text: string, lang: Language = "en") {
  const [state, setState] = useState<SpeechState>({
    speaking: false, supported: false, availableVoices: [], currentSentence: -1, error: null,
  });
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);

  // Check support
  useEffect(() => {
    const supported = typeof window !== "undefined" && "speechSynthesis" in window;
    if (!supported) { setState((s) => ({ ...s, supported: false, error: "Text-to-speech not supported in this browser." })); return; }
    setState((s) => ({ ...s, supported: true }));
  }, []);

  // Split text into sentences
  useEffect(() => {
    sentencesRef.current = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [text]);

  // Get available voices for lang
  const getVoice = useCallback((bcp: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => v.lang.startsWith(bcp.split("-")[0])) ?? null;
  }, []);

  const speak = useCallback((speed: number = 1) => {
    if (!state.supported) return;
    window.speechSynthesis.cancel();

    const sentences = sentencesRef.current;
    if (!sentences.length) return;

    let idx = 0;

    function speakNext() {
      if (idx >= sentences.length) {
        setState((s) => ({ ...s, speaking: false, currentSentence: -1 }));
        return;
      }
      const utt = new SpeechSynthesisUtterance(sentences[idx]);
      const bcp = LANG_BCP47[lang] ?? "en-IN";
      const voice = getVoice(bcp);
      if (voice) {
        utt.voice = voice;
        utt.lang  = voice.lang;
      } else {
        utt.lang = bcp;
      }
      utt.rate = speed;

      const currentIdx = idx;
      utt.onstart = () => setState((s) => ({ ...s, speaking: true, currentSentence: currentIdx, error: null }));
      utt.onend   = () => { idx++; speakNext(); };
      utt.onerror = (e) => {
        // "interrupted" fires on cancel — not a real error
        if (e.error !== "interrupted") {
          setState((s) => ({ ...s, speaking: false, error: `Speech error: ${e.error}` }));
        }
      };
      uttRef.current = utt;
      window.speechSynthesis.speak(utt);
    }

    speakNext();
  }, [state.supported, lang, getVoice]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setState((s) => ({ ...s, speaking: false, currentSentence: -1 }));
  }, []);

  const pause = useCallback(() => window.speechSynthesis?.pause(), []);
  const resume = useCallback(() => window.speechSynthesis?.resume(), []);

  return { state, speak, stop, pause, resume, sentences: sentencesRef.current };
}
