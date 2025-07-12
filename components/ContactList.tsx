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
      <tbody className="bg-white divide-y divide-gray-200">
        {contacts.map(c => (
          <tr key={c.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              <Link href={`/contacts/${c.id}`} legacyBehavior>
                <a className="text-indigo-600 hover:text-indigo-900">
                  {c.firstName} {c.lastName}
                </a>
              </Link>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.company || '–'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{/* Placeholder for Next Follow-Up */}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
