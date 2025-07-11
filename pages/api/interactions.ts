// pages/api/interactions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { contactId } = req.query;
    if (!contactId) return res.status(400).json({ error: 'Missing contactId' });
    const interactions = await prisma.interaction.findMany({
      where: { contactId: contactId as string },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(interactions);
  } else if (req.method === 'POST') {
    const { contactId, date, type, notes, nextFollowUpDate, reminderSet } = req.body;
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
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
