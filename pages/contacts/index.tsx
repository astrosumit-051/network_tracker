// pages/contacts/index.tsx
import useSWR from 'swr';
import ContactList from '../../components/ContactList';
import { Contact } from '@prisma/client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    if (res.status === 401) {
      signIn();
    }
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
});

export default function ContactsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn(undefined, { callbackUrl: '/contacts' });
    },
  });

  const { data: contacts, error } = useSWR<Contact[]>('/api/contacts', fetcher);

  if (status === 'loading') {
    return <p className="text-center py-10">Loading session...</p>;
  }

  // Session is required, so session object will be available here
  if (!session) {
      return null; // Or a loading indicator
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div>
          <span className="text-sm mr-4">Signed in as {session.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-bold rounded shadow text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <Link href="/contacts/new" legacyBehavior>
          <a className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow">
            Add New Contact
          </a>
        </Link>
      </div>

      {error && <p className="text-center py-8 text-red-500">Error loading contacts.</p>}
      {!contacts && !error && <p className="text-center py-8">Loading contacts...</p>}
      {contacts && contacts.length > 0 && (
        <ContactList contacts={contacts} />
      )}
      {contacts && contacts.length === 0 && (
        <div className="text-center py-10">
            <p className="text-xl text-gray-600 mb-4">No contacts found.</p>
            <p className="text-gray-500">Why not add your first one?</p>
        </div>
      )}
    </div>
  );
}
