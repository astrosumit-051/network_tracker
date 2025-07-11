// pages/contacts/[id].tsx
import { GetServerSideProps } from 'next';
import { prisma } from '../../lib/prisma';
import ContactDetail from '../../components/ContactDetail';
import InteractionForm from '../../components/InteractionForm';
import { Contact, Interaction } from '@prisma/client';

type Props = {
  contact: Contact;
  interactions: Interaction[];
};

export default function ContactPage({ contact, interactions }: Props) {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <ContactDetail contact={contact} interactions={interactions} />
      <InteractionForm contactId={contact.id} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id as string;
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) return { notFound: true };

  const interactions = await prisma.interaction.findMany({
    where: { contactId: id },
    orderBy: { date: 'desc' },
  });
  return { props: { contact, interactions } };
};
