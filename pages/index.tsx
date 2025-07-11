// pages/index.tsx
import { GetServerSideProps } from 'next';
import { prisma } from '../lib/prisma';

type Props = {
  totalContacts: number;
  upcomingReminders: number;
};

export default function Home({ totalContacts, upcomingReminders }: Props) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-medium">Total Contacts</h2>
          <p className="text-2xl">{totalContacts}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-medium">Upcoming Follow-Ups</h2>
          <p className="text-2xl">{upcomingReminders}</p>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const totalContacts = await prisma.contact.count();
  const upcomingReminders = await prisma.interaction.count({
    where: {
      reminderSet: true,
      nextFollowUpDate: { gte: new Date() },
    },
  });
  return { props: { totalContacts, upcomingReminders } };
};
