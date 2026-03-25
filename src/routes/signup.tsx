import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '#/lib/auth-client';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '#/components/ds';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
});

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/',
      });
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
          <CardTitle className="text-2xl font-bold text-center text-slate-900">Criar conta</CardTitle>
          <p className="text-sm text-center text-slate-500">
            Insira seus dados para começar no FinançasHub
          </p>
        </CardHeader>
        <CardContent className="mt-4">
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">Nome</label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">E-mail</label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Criando conta..." : "Criar minha conta"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-600">
            Já tem uma conta?{" "}
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Faça login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
