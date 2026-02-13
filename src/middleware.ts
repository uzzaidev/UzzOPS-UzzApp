import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/pending');

  // Redirecionar para login se não autenticado e tentando acessar rota protegida
  if (!user && !isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirecionar para projetos se já autenticado e tentando acessar login/register
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  // Verificar se usuário pendente tenta acessar o dashboard
  if (user && !isPublicAuthRoute) {
    const { data: member } = await supabase
      .from('company_members')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (member && member.status === 'pending' && !pathname.startsWith('/pending')) {
      return NextResponse.redirect(new URL('/pending', request.url));
    }
  }

  // Usuário aprovado tentando acessar /pending → vai para projetos
  if (user && pathname.startsWith('/pending')) {
    const { data: member } = await supabase
      .from('company_members')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member || member.status === 'active') {
      return NextResponse.redirect(new URL('/projects', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
