import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// IMPORTANT: This is a placeholder for demonstration.
// For a real application, you MUST implement proper user models,
// password hashing (e.g., bcrypt), and secure user lookup from your database.
const DUMMY_USER = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123', // In a real app, this would be a hashed password.
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // IMPORTANT: Authentication logic here
        // This is where you would look up the user in your database
        // and verify their password.
        if (
          credentials &&
          credentials.email === DUMMY_USER.email &&
          credentials.password === DUMMY_USER.password // DO NOT compare plain text passwords in production
        ) {
          // Any object returned will be saved in `user` property of the JWT
          return { id: DUMMY_USER.id, name: DUMMY_USER.name, email: DUMMY_USER.email };
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Using JWT for sessions
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    // error: '/auth/error', // Custom error page (optional)
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user id to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  // You might want to add a secret for production if not using VERCEL_URL
  // secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
