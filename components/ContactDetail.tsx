// components/ContactDetail.tsx
import { Contact, Interaction } from '@prisma/client';

type Props = {
  contact: Contact;
  interactions: Interaction[];
};

export default function ContactDetail({ contact, interactions }: Props) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        {contact.firstName} {contact.lastName}
      </h1>
      <p className="text-sm text-gray-600">
        {contact.title} at {contact.company}
      </p>
      <div className="mt-6 space-y-4">
        {interactions.map((i) => (
          <div key={i.id} className="p-4 bg-white rounded shadow">
            <p className="text-xs text-gray-500">
              {new Date(i.date).toLocaleDateString()} — {i.type}
            </p>
            <p className="mt-1 whitespace-pre-line">{i.notes}</p>
            {i.nextFollowUpDate && (
              <p className="mt-2 text-sm text-indigo-600">
                Next follow-up: {new Date(i.nextFollowUpDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
