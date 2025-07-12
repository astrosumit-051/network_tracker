import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }
    // In a multi-user app, you would also verify that the contactId belongs to the logged-in user.

    if (req.method === 'GET') {
        const { contactId } = req.query;
        if (!contactId) return res.status(400).json({ error: 'Missing contactId' });

        // Optional: Verify ownership of the contact
        // const contact = await prisma.contact.findFirst({ where: { id: contactId as string, userId: session.user.id }});
        // if (!contact) return res.status(404).json({ message: "Contact not found or access denied." });

        const interactions = await prisma.interaction.findMany({
            where: { contactId: contactId as string },
            orderBy: { date: 'desc' },
        });
        return res.status(200).json(interactions);
    } else if (req.method === 'POST') {
        const { contactId, date, type, notes, nextFollowUpDate, reminderSet } = req.body;
        if (!contactId || typeof contactId !== 'string') {
            return res.status(400).json({ message: 'Valid Contact ID is required' });
        }

        // Optional: Verify ownership of the contact before adding an interaction
        // const contact = await prisma.contact.findFirst({ where: { id: contactId, userId: session.user.id }});
        // if (!contact) return res.status(404).json({ message: "Contact not found or access denied." });

        try {
            const interaction = await prisma.interaction.create({
                data: {
                    contact: { connect: { id: contactId } },
                    date: new Date(date),
                    type,
                    notes,
                    nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
                    reminderSet,
                },
            });
            return res.status(201).json(interaction);
        } catch (error) {
            console.error(error);
            if ((error as any).code === 'P2003' || (error as any).code === 'P2025') {
                return res.status(400).json({ message: 'Invalid contactId: The specified contact does not exist.' });
            }
            res.status(500).json({ message: 'Error creating interaction' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
