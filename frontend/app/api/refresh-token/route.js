import { NextResponse } from "next/server";
import axios from "axios";

/**
 * Endpoint para atualizar o token JWT
 * Envia o token atual para o serviço de autenticação e obtém um novo token
 */
export async function POST(request) {
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

    // Definindo a URL da API de autenticação
    const defaultAuthUrl = "http://localhost:8000/api";
    const authApiUrl =
      (process.env.AUTH_API_URL || defaultAuthUrl) + "/refresh";

    // Use 127.0.0.1 em vez de localhost para forçar IPv4
    const apiUrl = authApiUrl.replace("localhost", "127.0.0.1");

    console.log("Enviando requisição de refresh do token para:", apiUrl);

    try {
      // Chamar a API de autenticação para obter um novo token
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

      console.log("Token atualizado com sucesso:", response.data);

      // Verificar se a resposta contém um token
      if (!response.data.token) {
        return NextResponse.json(
          { error: "Resposta inválida do servidor de autenticação" },
          { status: 500 }
        );
      }

      // Retornar o novo token e dados do usuário
      return NextResponse.json(
        {
          token: response.data.token,
          user: response.data.user || null,
          message: "Token atualizado com sucesso",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erro ao atualizar token:", error.message);

      // Verifica se o erro tem uma resposta
      if (error.response) {
        return NextResponse.json(
          { error: error.response.data?.error || "Erro ao atualizar token" },
          { status: error.response.status || 401 }
        );
      }

      // Erro de comunicação com o servidor
      return NextResponse.json(
        { error: "Erro ao comunicar com o servidor de autenticação" },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar requisição de refresh:", error);

    return NextResponse.json(
      { error: "Erro ao processar a requisição de refresh do token" },
      { status: 500 }
    );
  }
}
