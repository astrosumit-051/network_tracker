import { useRouter } from 'next/router';
import useSWR from 'swr';
import ContactDetail from '../../components/ContactDetail';
import InteractionForm from '../../components/InteractionForm';
import { Contact, Interaction } from '@prisma/client';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

type ContactWithInteractions = Contact & { interactions: Interaction[] };

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    if (res.status === 401) signIn();
    throw new Error('Failed to fetch');
  }
  return res.json();
});

export default function ContactPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (id) signIn(undefined, { callbackUrl: `/contacts/${id}` });
      else signIn();
    },
  });

  const { data: contact, error, mutate } = useSWR<ContactWithInteractions>(
    id ? `/api/contacts/${id}` : null,
    fetcher
  );

  const handleInteractionAdded = () => {
    mutate();
  };

  if (status === 'loading' || (!contact && !error)) {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (!session) {
    return null; // Redirected by onUnauthenticated
  }

  if (error) return <p className="text-center py-8 text-red-500">Failed to load contact.</p>;
  if (!contact) return <p className="text-center py-8">Contact not found.</p>;

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
