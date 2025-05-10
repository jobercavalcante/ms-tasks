import { NextResponse } from "next/server";
import axios from "axios";
// Este arquivo não pode acessar as variáveis de ambiente do lado do cliente
// Mas pode acessar todas as variáveis do servidor

export async function POST(request) {
  // Definindo uma URL de fallback caso a variável de ambiente não esteja disponível
  const defaultAuthUrl = "http://localhost:8000/api";

  try {
    // Obtendo o token de autorização do cabeçalho
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const authApiUrl = (process.env.AUTH_API_URL || defaultAuthUrl) + "/logout";

    // Use 127.0.0.1 em vez de localhost para forçar IPv4
    const apiUrl = authApiUrl.replace("localhost", "127.0.0.1");

    console.log("Enviando requisição de logout para:", apiUrl);

    try {
      // Chamar a API de autenticação para invalidar o token
      const response = await axios.post(
        apiUrl,
        {}, // Corpo vazio
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      console.log("Logout realizado com sucesso no servidor:", response.data);

      // Retorna resposta de sucesso
      return NextResponse.json(
        { message: "Logout realizado com sucesso" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erro ao realizar logout no servidor:", error.message);

      // Mesmo com erro na API, retornamos sucesso para o cliente,
      // pois o logout local ainda é realizado
      return NextResponse.json(
        {
          message: "Logout realizado localmente",
          warning: "Não foi possível comunicar com o servidor de autenticação",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar requisição de logout:", error);

    return NextResponse.json(
      { error: "Erro ao processar a requisição de logout" },
      { status: 500 }
    );
  }
}
