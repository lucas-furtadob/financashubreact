import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
} from "#/components/ds";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [magicLinkSent, setMagicLinkSent] = useState(false);
	const [error, setError] = useState("");

	const handleGoogleLogin = async () => {
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/",
			});
		} catch (err) {
			console.error("Google login error:", err);
		}
	};

	const handleMagicLink = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			setError("Por favor, insira seu e-mail");
			return;
		}
		setError("");
		setLoading(true);
		try {
			await authClient.signIn.magicLink({
				email,
				callbackURL: "/",
			});
			setMagicLinkSent(true);
		} catch (err) {
			console.error("Magic link error:", err);
			setError("Erro ao enviar o link. Tente novamente.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lagoon/20 rounded-full blur-3xl" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-palm/20 rounded-full blur-3xl" />
			</div>

			<Card className="w-full max-w-[480px] glass-card rise-in flex flex-col items-center p-8 md:p-10 shadow-2xl">
				<CardHeader className="text-center p-0 mb-10 w-full transition-all">
					<CardTitle className="text-4xl font-display text-lagoon-deep tracking-tight mb-3">
						FinançasHub
					</CardTitle>
					<p className="text-sea-ink-soft text-lg font-medium opacity-90 leading-relaxed">
						Gerencie suas finanças de forma simples e eficiente
					</p>
				</CardHeader>
				<CardContent className="w-full space-y-6 pt-4">
					<Button
						variant="secondary"
						onClick={handleGoogleLogin}
						className="w-full h-12 text-base"
					>
						<svg
							className="w-5 h-5 mr-3"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continuar com Google
					</Button>

					<div className="relative flex items-center py-6 w-full">
						<div className="flex-grow border-t border-border opacity-50" />
						<span className="flex-shrink mx-4 text-sea-ink-soft text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">ou continue com</span>
						<div className="flex-grow border-t border-border opacity-50" />
					</div>

					{magicLinkSent ? (
						<div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
							<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
								<Mail className="w-6 h-6 text-green-600" />
							</div>
							<p className="font-semibold text-green-800 mb-1">Link enviado!</p>
							<p className="text-sm text-green-700">
								Enviamos um link de acesso para <strong>{email}</strong>
							</p>
							<p className="text-xs text-green-600 mt-2">
								Clique no link no seu e-mail para acessar
							</p>
							<button
								type="button"
								onClick={() => setMagicLinkSent(false)}
								className="text-sm text-green-700 underline mt-3 hover:text-green-800"
							>
								Enviar para outro e-mail
							</button>
						</div>
					) : (
						<form onSubmit={handleMagicLink} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-sm font-medium text-sea-ink-soft"
								>
									E-mail
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
									<Input
										id="email"
										type="email"
										placeholder="seu@email.com"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setError("");
										}}
										required
										disabled={loading}
										className="pl-10 h-12"
									/>
								</div>
							</div>
							{error && (
								<p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded">
									{error}
								</p>
							)}
							<Button
								type="submit"
								disabled={loading}
								className="w-full h-12 text-base"
							>
								{loading ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<>
										Enviar Link Mágico
										<ArrowRight className="w-4 h-4 ml-2" />
									</>
								)}
							</Button>
						</form>
					)}

					<p className="text-center text-sm text-sea-ink-soft pt-4">
						Não tem uma conta?{" "}
						<a
							href="/signup"
							className="text-lagoon-deep font-medium hover:underline"
						>
							Cadastre-se
						</a>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
