import { useState, useEffect, useRef, useCallback } from 'react';

// Make sure to declare the properties on the window object if they don't exist
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceRecognitionOptions {
  onResult?: (transcript: string) => void;
  continuous?: boolean;
  lang?: string;
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useVoiceRecognition = ({ onResult, continuous = false, lang = 'fr-FR' }: VoiceRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any | null>(null);

  const hasSupport = !!SpeechRecognitionAPI;

  const processResult = useCallback((event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    setTranscript(interimTranscript);

    if (finalTranscript && onResult) {
      onResult(finalTranscript.trim());
    }
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  useEffect(() => {
    if (!hasSupport) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = processResult;
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      stopListening();
    };
    recognition.onend = () => {
      if (!recognition.continuous) {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    
    return () => {
      recognition.stop();
    };
  }, [hasSupport, continuous, lang, processResult, stopListening]);


  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport,
  };
};
