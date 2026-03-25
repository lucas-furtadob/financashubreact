import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { organization, magicLink } from "better-auth/plugins";
import { db } from '../db/index.ts';
import * as schema from '../db/schema.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      // Se houver convites, adicionar aqui
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'PENDING',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PENDING',
    },
  },
  plugins: [
    tanstackStartCookies(),
    organization(),
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        // TODO: Implementar envio de e-mail (Resend, Nodemailer, etc.)
        console.log(`Magic Link para ${email}: ${url}`);
      },
    }),
  ],
});
