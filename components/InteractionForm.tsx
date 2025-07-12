// components/InteractionForm.tsx
import { useState } from 'react';
import VoiceNoteInput from './VoiceNoteInput';

type Props = {
  contactId: string;
  onInteractionAdded: () => void; // Callback to refresh interactions list
};

export default function InteractionForm({ contactId, onInteractionAdded }: Props) {
  const [type, setType] = useState('call'); // Default to 'call' or make it empty if "Select..." is preferred
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [reminderSet, setReminderSet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!type) {
      setError("Please select an interaction type.");
      setIsSubmitting(false);
      return;
    }
    if (!date) {
      setError("Please select a date for the interaction.");
      setIsSubmitting(false);
      return;
    }


    const interactionData = {
      contactId,
      date,
      type,
      notes,
      nextFollowUpDate: reminderSet && nextFollowUpDate ? nextFollowUpDate : null,
      reminderSet,
    };

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add interaction');
      }

      // Clear form
      setType('call');
      setDate(new Date().toISOString().substr(0, 10));
      setNotes('');
      setNextFollowUpDate('');
      setReminderSet(false);

      onInteractionAdded(); // Notify parent component
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // This function seems to be intended for the VoiceNoteInput component's props
  // It's not directly used by InteractionForm itself but passed to VoiceNoteInput
  const aiAssist = async (currentNotes: string) => {
    // If currentNotes is empty, don't call API
    if (!currentNotes?.trim()) return '';
    try {
        const res = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send current notes as prompt
        body: JSON.stringify({ prompt: currentNotes }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            console.error("AI Assist Error:", errorData.message);
            return ''; // Or return currentNotes if API fails
        }
        const data = await res.json();
        return data.text || '';
    } catch (err) {
        console.error("AI Assist Network Error:", err);
        return ''; // Or return currentNotes
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-medium mb-4">Add New Interaction</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date*</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type*</label>
          <select id="type" value={type} onChange={e => setType(e.target.value)} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="event">Event</option>
            <option value="linkedin">LinkedIn Message</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        {/* Pass notes state and setNotes to VoiceNoteInput, along with aiAssist */}
        <VoiceNoteInput
            value={notes}
            onChange={setNotes}
            aiAssist={() => aiAssist(notes)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <label htmlFor="nextFollowUpDate" className="block text-sm font-medium text-gray-700">Next Follow-Up Date</label>
          <input type="date" id="nextFollowUpDate" value={nextFollowUpDate}
                 onChange={e => setNextFollowUpDate(e.target.value)}
                 disabled={!reminderSet}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"/>
        </div>
        <div className="pt-5"> {/* Adjusted padding for alignment */}
          <label htmlFor="reminderSet" className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" id="reminderSet" checked={reminderSet}
                   onChange={e => {
                       setReminderSet(e.target.checked);
                       if (!e.target.checked) { // Clear date if reminder is unchecked
                           setNextFollowUpDate('');
                       }
                   }}
                   className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
            Set Reminder
          </label>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

      <button type="submit" disabled={isSubmitting}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
        {isSubmitting ? 'Saving...' : 'Save Interaction'}
      </button>
    </form>
  );
}
