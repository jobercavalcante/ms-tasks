import { NextResponse } from "next/server";
import authService from "./services/authService";
import jwt from "jsonwebtoken";

export function middleware(request) {
  // Verificar se a requisição está indo para uma rota protegida
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // Verificar Token JWT nos cookies
  const token = request.cookies.get("auth_token")?.value;

  if (isProtectedRoute && !token) {
    // Redirecionar para a página de login se não houver token
    return NextResponse.redirect(new URL("/", request.url));
  }

  const tokenVerification = verifyToken(token);
  if (!tokenVerification.isValid) {
    // Se o token for inválido, redirecionar para a página de login
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Permitir que a requisição continue
  return NextResponse.next();
}

function verifyToken(token) {
  if (!token) {
    return { isValid: false, error: "Token não fornecido" };
  }

  try {
    // Decodificar o token sem verificar a assinatura
    const decodedToken = jwt.decode(token);

    if (!decodedToken) {
      return { isValid: false, error: "Token inválido" };
    }

    // Verificar se o token contém os campos necessários
    if (!decodedToken.email || !decodedToken.exp) {
      return {
        isValid: false,
        error: "Token inválido ou informações ausentes",
        decodedToken,
      };
    }

    // Verificar se o token expirou
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      return {
        isValid: false,
        error: "Token expirado",
        decodedToken,
        expiredAt: new Date(decodedToken.exp * 1000).toLocaleString(),
      };
    }

    // Token válido
    return {
      isValid: true,
      decodedToken,
      expiresAt: new Date(decodedToken.exp * 1000).toLocaleString(),
    };
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return { isValid: false, error: "Erro ao processar o token" };
  }
}

// Configurar em quais caminhos o middleware deve ser executado
export const config = {
  // Executar o middleware nestas rotas:
  matcher: ["/dashboard/:path*", "/api/tasks/:path*", "/api/me"],
};
