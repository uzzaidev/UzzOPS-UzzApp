'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      // Aguarda um momento para o trigger criar profiles + company_members, então redireciona
      setTimeout(() => {
        router.push('/pending');
        router.refresh();
      }, 1500);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-uzzai-primary/10 via-white to-uzzai-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-uzzai-primary to-uzzai-secondary rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">Uzz</span>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-uzzai-primary to-uzzai-secondary bg-clip-text text-transparent">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Solicite acesso ao UzzOps
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              <p className="font-semibold text-gray-800">Conta criada com sucesso!</p>
              <p className="text-sm text-muted-foreground">
                Aguardando aprovação do administrador...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="h-11"
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-uzzai-primary to-uzzai-secondary hover:opacity-90 transition-opacity text-base font-medium"
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Solicitar Acesso'}
              </Button>

              <div className="text-center text-sm text-gray-500 pt-2 border-t">
                Já tem conta?{' '}
                <Link href="/login" className="text-uzzai-primary hover:underline font-medium">
                  Entrar
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
