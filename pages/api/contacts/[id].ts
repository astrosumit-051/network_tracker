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
  // In a multi-user app, ensure the contact belongs to session.user.id before any operation.

  const contactId = req.query.id as string;

  // Helper function to check ownership (example for multi-user)
  // const verifyOwnership = async (contactId: string) => {
  //   const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  //   return contact && contact.userId === session.user.id;
  // };

  switch (req.method) {
    case 'GET':
      try {
        // if (!await verifyOwnership(contactId)) return res.status(403).json({ message: 'Forbidden' });
        const contact = await prisma.contact.findUnique({
          where: { id: contactId },
          include: { interactions: { orderBy: { date: 'desc' } } },
        });
        if (!contact) {
          return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json(contact);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching contact' });
      }
      break;
    case 'PUT':
      try {
        // if (!await verifyOwnership(contactId)) return res.status(403).json({ message: 'Forbidden' });
        const contactData = req.body;
        // Ensure userId is not changed if present in body for multi-user app
        // if (contactData.userId) delete contactData.userId;
        const updatedContact = await prisma.contact.update({
          where: { id: contactId },
          data: contactData,
        });
        res.status(200).json(updatedContact);
      } catch (error) {
        console.error(error);
        if ((error as any).code === 'P2025') {
          return res.status(404).json({ message: 'Contact not found for update' });
        }
        res.status(500).json({ message: 'Error updating contact' });
      }
      break;
    case 'DELETE':
      try {
        // if (!await verifyOwnership(contactId)) return res.status(403).json({ message: 'Forbidden' });
        await prisma.interaction.deleteMany({
          where: { contactId: contactId },
        });
        await prisma.contact.delete({
          where: { id: contactId },
        });
        res.status(204).end();
      } catch (error) {
        console.error(error);
        if ((error as any).code === 'P2025') {
          return res.status(404).json({ message: 'Contact not found for delete' });
        }
        res.status(500).json({ message: 'Error deleting contact' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
