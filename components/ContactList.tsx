// components/ContactList.tsx
import Link from 'next/link';
import { Contact } from '@prisma/client';

type Props = { contacts: Contact[] };

export default function ContactList({ contacts }: Props) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th>Name</th><th>Company</th><th>Email</th><th>Next Follow-Up</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map(c => (
          <tr key={c.id} className="hover:bg-gray-100">
            <td>
              <Link href={`/contacts/${c.id}`}>
                <a className="text-indigo-600">
                  {c.firstName} {c.lastName}
                </a>
              </Link>
            </td>
            <td>{c.company || '–'}</td>
            <td>{c.email}</td>
            <td>{/* you can fetch nextFollowUpDate */}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
