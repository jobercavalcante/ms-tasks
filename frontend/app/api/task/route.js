import { NextResponse } from "next/server";
import axios from "axios";
// Este arquivo não pode acessar as variáveis de ambiente do lado do cliente
// Mas pode acessar todas as variáveis do servidor

export async function GET(request) {
  // Definindo uma URL de fallback caso a variável de ambiente não esteja disponível
  const defaultAuthUrl = "http://localhost:8000/api";

  try {
    // Obtendo o token de autorização do cabeçalho
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const apiUrl = (process.env.TASK_API_URL || defaultAuthUrl) + "/tasks";

    try {
      // Chamar a API de autenticação para invalidar o token
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Retorna resposta de sucesso
      return NextResponse.json({ data: response.data }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: error.response?.data?.error || "Erro ao buscar tarefas" },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar a requisição de logout" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Definindo uma URL de fallback caso a variável de ambiente não esteja disponível
  const defaultAuthUrl = "http://localhost:8000/api";

  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const data = await request.json();

    const apiUrl = (process.env.TASK_API_URL || defaultAuthUrl) + "/tasks";

    try {
      // Chamar a API de autenticação para invalidar o token
      const response = await axios.post(
        apiUrl,
        {
          title: data.title,
          description: data.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Retorna resposta de sucesso
      return NextResponse.json({ data: response.data }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          error: error.response?.data?.error || "Erro ao criar tarefa",
        },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar a requisição de logout" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  // Definindo uma URL de fallback caso a variável de ambiente não esteja disponível
  const defaultAuthUrl = "http://localhost:8000/api";

  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const data = await request.json();

    const apiUrl =
      (process.env.TASK_API_URL || defaultAuthUrl) + "/tasks/" + data.id;

    try {
      // Chamar a API de autenticação para invalidar o token
      const response = await axios.put(
        apiUrl,
        {
          title: data.title,
          description: data.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Retorna resposta de sucesso
      return NextResponse.json({ data: response.data }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          error: error.response?.data?.error || "Erro ao editar tarefas",
        },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar a requisição de logout" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  // Definindo uma URL de fallback caso a variável de ambiente não esteja disponível
  const defaultAuthUrl = "http://localhost:8000/api";

  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const data = await request.json();

    const apiUrl =
      (process.env.TASK_API_URL || defaultAuthUrl) + "/tasks/" + data.id;

    try {
      // Chamar a API de autenticação para invalidar o token
      const response = await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Retorna resposta de sucesso
      return NextResponse.json({ data: response.data }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          error: error.response?.data?.error || "Erro ao editar tarefas",
          token: token,
        },
        { status: error.response?.status || 500 },
        { token: token }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar a requisição de logout" },
      { status: 500 }
    );
  }
}

const getAuthToken = (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};
