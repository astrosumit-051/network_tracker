import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    // If no session exists, return a 401 Unauthorized error
    return res.status(401).json({ message: 'You must be logged in to access this data.' });
  }

  // If a session exists, proceed to fetch and return the data
  if (req.method === 'GET') {
    try {
      // Note: In a multi-tenant app, you'd filter these counts by the session.user.id
      const totalContacts = await prisma.contact.count();
      const upcomingReminders = await prisma.interaction.count({
        where: {
          reminderSet: true,
          nextFollowUpDate: { gte: new Date() },
        },
      });

      res.status(200).json({ totalContacts, upcomingReminders });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
