"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import loginStyles from "./login.module.css";
import config from "./config";
import authService from "../services/authService";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default function Home() {
  // Usando variáveis de ambiente expostas ao cliente
  const appName = process.env.NEXT_PUBLIC_APP_NAME || config.appName;
  // Estado para gerenciar os dados do login e erros
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    // Usando o serviço de autenticação para verificar se o usuário está autenticado
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        console.log("Usuário já autenticado, redirecionando para o dashboard.");
        // Usando replace para evitar problemas de histórico de navegação
        window.location.href = "/dashboard";
      }
    };

    checkAuth();
  }, []);

  // Função para lidar com as mudanças nos campos
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  // Função para processar o login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Tente primeiro usar o backend real, caso falhe, use o mock
      let response;
      try {
        response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          signal: AbortSignal.timeout(5000), // 5 segundos timeout
        });
      } catch (e) {
        console.log("Erro ao acessar API real, usando mock:", e);
        // Falha no backend real, tentar com o mock
        response = await fetch("/api/mock-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.token) {
        setError("Formato de resposta inválido do servidor.");
        return;
      }

      // Verificar se o token é válido usando o authService
      const tokenVerification = authService.verifyToken(data.token);

      if (!tokenVerification.isValid) {
        setError(tokenVerification.error);
        return;
      }

      // Salvar o token e informações do usuário usando o authService
      const saveSuccess = authService.saveAuthData(data.token, data.user);

      if (saveSuccess) {
        console.log("Login bem-sucedido! Token salvo.");

        // Redirecionar após login bem-sucedido
        router.push("/dashboard");
      } else {
        setError("Falha ao salvar dados de autenticação.");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor. Tente novamente.");
      console.error("Erro de login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={loginStyles.container}>
      <form className={loginStyles.loginForm} onSubmit={handleSubmit}>
        <h2>{appName}</h2>
        <p>Entre com suas credenciais para acessar o sistema</p>

        {error && <div className={loginStyles.errorMessage}>{error}</div>}

        <div className={loginStyles.formGroup}>
          <label htmlFor="email">Email:</label>
          <Form.Control
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Seu email"
            required
          />
        </div>

        <div className={loginStyles.formGroup}>
          <label htmlFor="password">Senha:</label>
          <Form.Control
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Sua senha"
            required
          />
        </div>

        <Button type="submit" className="btn btn-dark" disabled={loading}>
          {loading ? "Processando..." : "Entrar"}
        </Button>

        <p style={{ textAlign: "center", marginTop: "16px" }}>
          Não tem uma conta? <a href="/register">Cadastre-se</a>
        </p>
      </form>
    </div>
  );
}
