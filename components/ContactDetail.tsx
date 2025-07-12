// components/ContactDetail.tsx
import { Contact, Interaction } from '@prisma/client';

// Using the combined type for clarity, assuming it might be imported or defined globally later
type ContactWithInteractions = Contact & { interactions: Interaction[] };

type Props = {
  contact: ContactWithInteractions;
  // The separate 'interactions' prop is removed as it's part of contact
};

export default function ContactDetail({ contact }: Props) {
  const { interactions } = contact; // Destructure interactions from contact

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-1">
        {contact.firstName} {contact.lastName}
      </h2>
      <p className="text-md text-gray-700">
        {contact.title}{contact.company && ` at ${contact.company}`}
      </p>
      <div className="mt-2 space-y-2 text-sm">
        {contact.email && <p><strong>Email:</strong> <a href={`mailto:${contact.email}`} className="text-blue-500 hover:text-blue-700">{contact.email}</a></p>}
        {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
        {contact.linkedinUrl && <p><strong>LinkedIn:</strong> <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">Profile</a></p>}
        {contact.website && <p><strong>Website:</strong> <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">{contact.website}</a></p>}
        {contact.location && <p><strong>Location:</strong> {contact.location}</p>}
        {contact.timezone && <p><strong>Timezone:</strong> {contact.timezone}</p>}
        {contact.status && <p><strong>Status:</strong> <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{contact.status}</span></p>}
         {contact.tags && contact.tags.length > 0 && (
          <p><strong>Tags:</strong> {contact.tags.map(tag => (
            <span key={tag} className="mr-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              {tag}
            </span>
          ))}</p>
        )}
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-3">Interaction History</h3>
      {interactions && interactions.length > 0 ? (
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="p-4 bg-gray-50 rounded shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(interaction.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} — <span className="font-semibold">{interaction.type}</span>
                  </p>
                </div>
                {interaction.reminderSet && (
                    <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800" title="Reminder is set">
                        🔔 Reminder
                    </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{interaction.notes}</p>
              {interaction.nextFollowUpDate && (
                <p className="mt-2 text-xs text-indigo-700 font-semibold">
                  Next follow-up: {new Date(interaction.nextFollowUpDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No interactions logged yet.</p>
      )}
    </div>
  );
}
