import { NextResponse } from "next/server";
import axios from "axios";
// Este arquivo não pode acessar as variáveis de ambiente do lado do cliente
// Mas pode acessar todas as variáveis do servidor

export async function POST(request) {
  // Definindo uma URL de fallback caso a variável de ambiente não esteja disponível
  const defaultAuthUrl = "http://localhost:8000/api";

  let credentials = {};
  try {
    const body = await request.json();
    credentials = body;

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const authApiUrl =
      (process.env.AUTH_API_URL || defaultAuthUrl) + "/register";

    try {
      const response = await axios.post(authApiUrl, credentials);
      console.log("Login successful:", response.data);
      return NextResponse.json(response.data);
    } catch (error) {
      return NextResponse.json(
        { error: error.response?.data?.error || "Erro ao cadastrar" },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar a requisição de cadastro" },
      { status: 500 }
    );
  }
}
