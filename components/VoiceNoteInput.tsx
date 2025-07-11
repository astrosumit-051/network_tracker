// components/VoiceNoteInput.tsx
import { useEffect, useState, useRef } from 'react';

export default function VoiceNoteInput({
  onChange,
  aiAssist,
}: {
  onChange: (text: string) => void;
  aiAssist: () => Promise<string>;
}) {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setText(transcript);
        onChange(transcript);
      };
      recognitionRef.current = recog;
    }
  }, [onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setListening(!listening);
  };

  const handleAIAssist = async () => {
    const aiText = await aiAssist();
    setText((prev) => prev + '\n' + aiText);
    onChange(text + '\n' + aiText);
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full p-2 border rounded"
        rows={6}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
        }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`px-3 py-1 rounded ${
            listening ? 'bg-red-500 text-white' : 'bg-gray-200'
          }`}
        >
          {listening ? 'Stop Mic' : 'Start Mic'}
        </button>
        <button
          type="button"
          onClick={handleAIAssist}
          className="px-3 py-1 rounded bg-indigo-600 text-white"
        >
          AI-Assist Notes
        </button>
      </div>
    </div>
  );
}
