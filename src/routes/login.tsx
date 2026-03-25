import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '#/lib/auth-client';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '#/components/ds';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: '/',
      });
      setMagicLinkSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">FinançasHub</CardTitle>
          <p className="text-sm text-center text-slate-500">
            Escolha seu método de login preferido
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 mt-4">
          <div className="grid grid-cols-1 gap-6">
            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Google
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Ou continue com Link Mágico
              </span>
            </div>
          </div>
          {!magicLinkSent ? (
            <form onSubmit={handleMagicLink} className="grid gap-4">
              <div className="grid gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Link Mágico
              </Button>
            </form>
          ) : (
            <div className="text-center text-sm text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="font-semibold mb-1">Link enviado!</p>
              Verifique seu e-mail para acessar sua conta.
            </div>
          )}
          <div className="mt-4 text-center text-sm text-slate-600">
            Não tem uma conta?{" "}
            <a href="/signup" className="text-blue-600 font-medium hover:underline">
              Cadastre-se
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
