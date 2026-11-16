import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim();
        const password = String(credentials?.password ?? '');

        if (!email || !password || email.length > 255 || password.length > 128) {
          return null;
        }

        const [user] = await sql<
          { id: string; name: string; email: string; password: string }[]
        >`
          SELECT id, name, email, password
          FROM users
          WHERE LOWER(email) = LOWER(${email})
          LIMIT 1
        `;

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
