"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./logout.module.css";
import authService from "../../services/authService";
import Button from "react-bootstrap/Button";
/**
 * Componente de botão de logout que executa a função de logout
 * e redireciona o usuário para a página inicial
 */
export default function Navibar({ className }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Para detectar mudanças de rota

  const handleLogout = async () => {
    try {
      setLoading(true);

      // Chamar a API de logout
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Adicionar o token de autorização ao cabeçalho
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      // Limpar os dados de autenticação locais
      authService.logout();

      // Redirecionar para a página inicial
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);

      // Mesmo em caso de erro no servidor, fazemos logout local
      authService.logout();
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar se o usuário está autenticado a cada mudança de rota
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsLoggedIn(isAuth);
    };

    // Verificar imediatamente
    checkAuth();

    // Configurar um evento personalizado para detectar alterações de autenticação
    const handleAuthChange = () => {
      checkAuth();
    };

    // Adicionar listener para o evento customizado
    window.addEventListener("authStateChanged", handleAuthChange);

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, [pathname]); // Re-executar quando a rota mudar

  return (
    <>
      {isLoggedIn && (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container">
            <a className="navbar-brand" href="/">
              Gerenciamento de Tarefas
            </a>

            <div className="navbar-nav">
              <Button
                className="btn  btn-dark"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? "Saindo..." : "Sair"}
              </Button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
