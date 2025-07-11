// pages/contacts/index.tsx
import { GetServerSideProps } from 'next';
import { prisma } from '../../lib/prisma';
import ContactList from '../../components/ContactList';
import { Contact } from '@prisma/client';

type Props = { contacts: Contact[] };

export default function ContactsPage({ contacts }: Props) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <ContactList contacts={contacts} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const contacts = await prisma.contact.findMany({
    orderBy: { lastName: 'asc' },
  });
  return { props: { contacts } };
};
