// pages/contacts/index.tsx
import { useState, useEffect } from 'react';
import ContactList from '../../components/ContactList';
import { Contact } from '@prisma/client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn(undefined, { callbackUrl: '/contacts' });
    }
  }, [status]);

  // Fetch contacts once authenticated
  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;

    const fetchContacts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/contacts');
        if (!res.ok) {
          if (res.status === 401) {
            signIn(undefined, { callbackUrl: '/contacts' });
            return;
          }
          throw new Error(res.statusText || 'Failed to fetch contacts');
        }
        const data: Contact[] = await res.json();
        if (!cancelled) setContacts(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContacts();
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === 'loading') {
    return <p className="text-center py-10">Loading session...</p>;
  }
  if (status === 'unauthenticated') {
    return <p className="text-center py-10">Redirecting to sign in...</p>;
  }

  // ——— Here’s the only change ———
  // Signed in as {session?.user?.email}
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div>
          <span className="text-sm mr-4">
            Signed in as {session?.user?.email}
          </span>
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

      {loading && !error && (
        <p className="text-center py-8">Loading contacts...</p>
      )}
      {error && (
        <p className="text-center py-8 text-red-500">
          Error loading contacts: {error}
        </p>
      )}
      {!loading && !error && contacts.length > 0 && (
        <ContactList contacts={contacts} />
      )}
      {!loading && !error && contacts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 mb-4">No contacts found.</p>
          <p className="text-gray-500">Why not add your first one?</p>
        </div>
      )}
    </div>
  );
}
