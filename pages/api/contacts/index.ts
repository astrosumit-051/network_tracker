import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in.' });
  }
  // In a multi-user app, you'd associate contacts with session.user.id

  switch (req.method) {
    case 'GET':
      try {
        const contacts = await prisma.contact.findMany({
          // where: { userId: session.user.id }, // Example for multi-user
          orderBy: { lastName: 'asc' },
        });
        res.status(200).json(contacts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching contacts' });
      }
      break;
    case 'POST':
      try {
        const contactData = {
          ...req.body,
          // userId: session.user.id // Attach contact to the logged-in user
        };
        const newContact = await prisma.contact.create({
          data: contactData,
        });
        res.status(201).json(newContact);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating contact' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
