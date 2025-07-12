// components/VoiceNoteInput.tsx
import { useEffect, useState, useRef } from 'react';

type VoiceNoteInputProps = {
  value: string; // Current text value from parent
  onChange: (newText: string) => void; // To update text in parent
  aiAssist: () => Promise<string>; // Function to call AI backend, provided by parent
};

export default function VoiceNoteInput({
  value,
  onChange,
  aiAssist,
}: VoiceNoteInputProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition for simplicity

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = true; // Keep listening even after a pause
      recognitionInstance.interimResults = true; // Get results as they come in

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Update with the final transcript or the latest interim
        // Append new transcript to existing value if value is not empty
        const currentVal = value || '';
        onChange(currentVal + (finalTranscript || interimTranscript));
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setListening(false); // Stop listening on error
      };

      recognitionInstance.onend = () => {
        // Only set listening to false if it was intentionally stopped
        // If it's continuous and just paused, it might restart automatically or on next .start()
        // For this setup, if it ends and we weren't trying to stop, maybe keep listening true or re-evaluate
      };

      recognitionRef.current = recognitionInstance;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    // Cleanup: stop recognition if component unmounts while listening
    return () => {
      if (recognitionRef.current && listening) {
        recognitionRef.current.stop();
      }
    };
  }, [onChange, value, listening]); // Added value to dependencies if recognition logic depends on it (e.g. for appending)

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not available or not initialized.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      // Clear previous text before starting new dictation if value is empty, or append.
      // Current setup appends. If you want to replace, onChange should replace.
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleAIAssistClick = async () => {
    try {
      const aiGeneratedText = await aiAssist(); // This calls the function passed from InteractionForm
      if (aiGeneratedText) {
        // Append AI text to the current notes
        onChange(value + '\n' + aiGeneratedText);
      }
    } catch (error) {
      console.error('Error during AI Assist:', error);
      // Optionally, display an error to the user
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        rows={6}
        value={value} // Controlled by parent's state
        onChange={(e) => onChange(e.target.value)} // Manual edits update parent's state
        placeholder="Type or use microphone to dictate notes..."
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            listening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {listening ? 'Stop Microphone' : 'Start Microphone'}
        </button>
        <button
          type="button"
          onClick={handleAIAssistClick}
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          AI-Assist Notes
        </button>
      </div>
    </div>
  );
}
