import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import useSWR from 'swr';
import { Contact } from '@prisma/client';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NewInteractionPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn(undefined, { callbackUrl: '/interactions/new' });
    },
  });

  const { data: contacts, error: contactsError } = useSWR<Contact[]>('/api/contacts', fetcher);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const interactionData = Object.fromEntries(formData.entries());

    if (!interactionData.contactId) {
        setError("Please select a contact.");
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log interaction');
      }

      router.push(`/contacts/${interactionData.contactId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || (!contacts && !contactsError)) {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (!session) {
    return null; // Should be redirected
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-start mb-6">
        <Link href="/" legacyBehavior>
            <a className="text-indigo-600 hover:text-indigo-800">&larr; Back to Dashboard</a>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Log a New Interaction</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        <div>
            <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">Contact</label>
            <select name="contactId" id="contactId" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select a contact</option>
                {contacts && contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>
                ))}
            </select>
            {contactsError && <p className="text-red-500 text-sm mt-1">Could not load contacts.</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="date" id="date" defaultValue={new Date().toISOString().split('T')[0]} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select name="type" id="type" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
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
            <textarea name="notes" id="notes" rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
            <button type="submit" disabled={isSubmitting || !contacts} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Interaction'}
            </button>
        </div>
      </form>
    </div>
  );
}
