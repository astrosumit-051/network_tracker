import { GetServerSideProps } from 'next';
import { useSession, signIn, signOut } from 'next-auth/react';
import { prisma } from '../lib/prisma'; // Assuming prisma is correctly set up
import { useEffect, useState } from 'react';
import Link from 'next/link';

type DashboardStats = {
  totalContacts: number;
  upcomingReminders: number;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch stats only if authenticated
      const fetchStats = async () => {
        try {
          setLoadingStats(true);
          // In a real app, this would be an API call protected by auth
          // For now, we re-fetch using a new mechanism or ensure getServerSideProps runs under auth
          // This example will assume stats are fetched client-side or passed if page is protected by SSR auth
          // Since getServerSideProps is removed for client-side auth handling, we fetch client-side.

          // Placeholder: Ideally, create an API endpoint for dashboard stats
          // For demonstration, let's simulate fetching or use static data if no API endpoint is ready.
          // This part needs adjustment based on how you want to fetch data post-auth.
          // The original getServerSideProps logic can be moved to an API route.

          // Simulating API call for stats
          const response = await fetch('/api/dashboard-stats'); // You'll need to create this API route
          if (!response.ok) throw new Error('Failed to fetch stats');
          const data: DashboardStats = await response.json();
          setStats(data);

        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error);
          setStats({ totalContacts: 0, upcomingReminders: 0 }); // Fallback stats
        } finally {
          setLoadingStats(false);
        }
      };
      fetchStats();
    }
  }, [status]);

  if (status === 'loading') {
    return <p className="text-center py-10">Loading session...</p>;
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn(); // Redirects to sign-in page configured in NextAuth
    }
  }, [status]);

  if (status === 'loading') {
    return <p className="text-center py-10">Loading session...</p>;
  }

  if (!session) {
    // Session is not loaded yet or user is unauthenticated
    return <p className="text-center py-10">Redirecting to sign in...</p>;
  }

  // Signed in
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div>
          <span className="text-sm mr-4">Signed in as {session.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-bold rounded shadow"
          >
            Sign Out
          </button>
        </div>
      </div>

      {loadingStats ? (
        <p>Loading dashboard data...</p>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700">Total Contacts</h2>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalContacts}</p>
            <Link href="/contacts" legacyBehavior>
              <a className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">View Contacts &rarr;</a>
            </Link>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700">Upcoming Follow-Ups</h2>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.upcomingReminders}</p>
            {/* You might want a link to a page showing these reminders */}
            <a href="#" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">View Reminders &rarr;</a>
          </div>
        </div>
      ) : (
        <p>Could not load dashboard data.</p>
      )}
       <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="flex space-x-4">
            <Link href="/contacts/new" legacyBehavior>
                <a className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow">
                    Add New Contact
                </a>
            </Link>
            {/* Add other quick actions here, e.g., Add Interaction, View Calendar */}
          </div>
      </div>
    </div>
  );
}

// Note: getServerSideProps is removed for client-side authentication handling with useSession.
// If you need server-side protection or data fetching that depends on session,
// you would use getServerSideProps with unstable_getServerSession.
// For client-side fetching of stats, an API route like /api/dashboard-stats (protected) would be needed.
// The code above simulates this client-side fetch.
// I will create the /api/dashboard-stats route next.
