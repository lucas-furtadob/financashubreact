import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Resend } from "resend";
import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

export const auth = betterAuth({
	trustedOrigins: [
		"http://localhost:3000",
		"http://localhost:3002",
		"http://localhost:3008",
		"http://localhost:3009",
		"http://localhost:3011",
		"https://financashubreact.vercel.app",
	],
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
				if (!resend) {
					console.log(`Magic Link para ${email}: ${url}`);
					return;
				}
				try {
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
					console.log("E-mail enviado:", result);
				} catch (error) {
					console.error("Erro ao enviar e-mail:", error);
				}
			},
		}),
	],
});
