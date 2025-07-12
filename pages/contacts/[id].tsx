import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ContactDetail from '../../components/ContactDetail';
import InteractionForm from '../../components/InteractionForm';
import { Contact, Interaction } from '@prisma/client';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

type ContactWithInteractions = Contact & { interactions: Interaction[] };

export default function ContactPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();

  const [contact, setContact] = useState<ContactWithInteractions | null>(null);
  const [loading, setLoading] = useState(true); // For contact data fetching
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/contacts/${id}`);
        if (response.status === 401) return signIn();
        if (response.status === 404) {
          setError('Contact not found.');
          return;
        }
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data: ContactWithInteractions = await response.json();
        setContact(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchContactDetails();
    }
  }, [id, status]);

  const handleInteractionAdded = () => {
    if (!id) return;
    // Re-fetch contact details to get the updated list of interactions
    async function fetchInteractions() {
        const response = await fetch(`/api/contacts/${id}`);
        if(response.ok) {
            const data: ContactWithInteractions = await response.json();
            setContact(data);
        }
    }
    fetchInteractions();
  };

  if (status === 'loading' || (loading && !error)) {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (status === 'unauthenticated') {
      useEffect(() => {
        signIn(undefined, { callbackUrl: `/contacts/${id}` });
      }, []);
      return <p className="text-center py-10">Redirecting to sign in...</p>;
  }

  if (error) return <p className="text-center py-8 text-red-500">{error}</p>;
  if (!contact) return <p className="text-center py-8">Contact data could not be loaded.</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div className="flex justify-start">
            <Link href="/contacts" legacyBehavior>
                <a className="text-indigo-600 hover:text-indigo-800">&larr; Back to Contacts</a>
            </Link>
        </div>
      <ContactDetail contact={contact} />
      <InteractionForm contactId={contact.id} onInteractionAdded={handleInteractionAdded} />
    </div>
  );
}
