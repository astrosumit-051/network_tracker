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

  const interactionId = req.query.id as string;

  // For a multi-user app, you would verify that the interaction belongs to the user
  // before allowing updates or deletes. This requires finding the interaction,
  // then its contact, and checking the contact's userId against session.user.id.

  // const verifyOwnership = async (interactionId: string) => {
  //   const interaction = await prisma.interaction.findUnique({
  //     where: { id: interactionId },
  //     select: { contact: { select: { userId: true } } }
  //   });
  //   return interaction?.contact.userId === session.user.id;
  // };


  switch (req.method) {
    case 'PUT':
      try {
        // if (!await verifyOwnership(interactionId)) return res.status(403).json({ message: 'Forbidden' });
        const interactionData = req.body;
        if (interactionData.contactId) {
          delete interactionData.contactId;
        }
        const updatedInteraction = await prisma.interaction.update({
          where: { id: interactionId },
          data: interactionData,
        });
        res.status(200).json(updatedInteraction);
      } catch (error) {
        console.error(error);
        if ((error as any).code === 'P2025') {
          return res.status(404).json({ message: 'Interaction not found for update' });
        }
        res.status(500).json({ message: 'Error updating interaction' });
      }
      break;
    case 'DELETE':
      try {
        // if (!await verifyOwnership(interactionId)) return res.status(403).json({ message: 'Forbidden' });
        await prisma.interaction.delete({
          where: { id: interactionId },
        });
        res.status(204).end();
      } catch (error) {
        console.error(error);
        if ((error as any).code === 'P2025') {
          return res.status(404).json({ message: 'Interaction not found for delete' });
        }
        res.status(500).json({ message: 'Error deleting interaction' });
      }
      break;
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
