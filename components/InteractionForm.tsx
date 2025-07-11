// components/InteractionForm.tsx
import { useState } from 'react';
import VoiceNoteInput from './VoiceNoteInput';

export default function InteractionForm({ contactId }: { contactId: string }) {
  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [reminderSet, setReminderSet] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactId,
        type,
        date,
        notes,
        nextFollowUpDate: nextFollowUpDate || null,
        reminderSet,
      }),
    });
    if (res.ok) {
      // reload to show new interaction
      window.location.reload();
    }
  };

  const aiAssist = async () => {
    const res = await fetch('/api/ai/generate-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: notes }),
    });
    const data = await res.json();
    return data.text || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">Add Interaction</h2>
      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 p-2 border rounded w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 p-2 border rounded w-full"
        >
          <option value="">Select…</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="event">Event</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <VoiceNoteInput onChange={setNotes} aiAssist={aiAssist} />
      </div>
      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={reminderSet}
            onChange={(e) => setReminderSet(e.target.checked)}
            className="mr-2"
          />
          Set Reminder
        </label>
        {reminderSet && (
          <input
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          />
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Save Interaction
      </button>
    </form>
  );
}
