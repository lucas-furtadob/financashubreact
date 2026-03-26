import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Resend } from "resend";
import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";

const getResend = () => {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
};

const getBaseURL = () => {
    if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
};

const trustedOrigins = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:3008",
    "http://localhost:3009",
    "http://localhost:3011",
    "https://financashubreact.vercel.app",
];

if (process.env.VERCEL_URL) {
    trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

export const auth = betterAuth({
    baseURL: getBaseURL(),
    trustedOrigins,
    database: drizzleAdapter(db, {
		provider: "pg",
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
			clientId: process.env.GOOGLE_CLIENT_ID || "PENDING",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PENDING",
		},
	},
	plugins: [
		tanstackStartCookies(),
		organization(),
				magicLink({
			sendMagicLink: async ({ email, url }) => {
				console.log("== Magic Link Process Started ==");
				console.log("Email target:", email);
				console.log("Email URL generated:", url);
				console.log("Resend Key Present? (length):", process.env.RESEND_API_KEY?.length || 0);

				const resend = getResend();
				if (!resend) {
					console.error("Resend is NOT initialized (missing API Key)");
					console.log(`[FALLBACK] Magic Link para ${email}: ${url}`);
					return;
				}
				try {
					console.log("Attempting to send email via Resend...");
					const result = await resend.emails.send({
						from: "FinançasHub <onboarding@resend.dev>",
						to: email,
						subject: "Seu Link de Acesso ao FinançasHub",
						html: `
							<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
								<h2 style="color: #173a40;">Bem-vindo ao FinançasHub!</h2>
								<p>Clique no botão abaixo para acessar sua conta:</p>
								<a href="${url}" style="display: inline-block; background: #4fb8b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Acessar Conta</a>
								<p style="color: #666; font-size: 14px;">Este link expira em 24 horas.</p>
								<p style="color: #999; font-size: 12px;">Se você não solicitou este e-mail, ignore-o.</p>
							</div>
						`,
					});
					console.log("Resend Success Result:", result);
				} catch (error) {
					console.error("Resend Failure Error:", error);
					throw error;
				}
			},
		}),
	],
});
