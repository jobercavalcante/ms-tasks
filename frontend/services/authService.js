"use client";

import jwt from "jsonwebtoken";

/**
 * Serviço de autenticação para gerenciar tokens JWT e autenticação de usuários
 */
class AuthService {
  /**
   * Verifica se o token JWT é válido
   * @param {string} token - O token JWT a ser verificado
   * @returns {Object} Um objeto com status da verificação e mensagem de erro, se houver
   */
  verifyToken(token) {
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

  /**
   * Salva o token de autenticação e informações do usuário no localStorage
   * @param {string} token - O token JWT
   * @param {Object} userData - Informações do usuário (opcional)
   * @returns {boolean} - Sucesso da operação
   */
  saveAuthData(token, userData = null) {
    try {
      if (!token) return false;

      localStorage.setItem("auth_token", token);
      // Também salvar o token como cookie para o middleware de autenticação
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Cookie válido por 7 dias

      document.cookie = `auth_token=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;

      if (userData) {
        localStorage.setItem("auth_user", JSON.stringify(userData));
      }

      // Disparar um evento customizado para notificar mudança no estado de autenticação
      if (typeof window !== "undefined") {
        const event = new Event("authStateChanged");
        window.dispatchEvent(event);
      }

      return true;
    } catch (error) {
      console.error("Erro ao salvar dados de autenticação:", error);
      return false;
    }
  }

  /**
   * Recupera o token de autenticação do localStorage
   * @returns {string|null} O token ou null se não existir
   */
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  /**
   * Recupera os dados do usuário do localStorage
   * @returns {Object|null} Dados do usuário ou null se não existir
   */
  getUserData() {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem("auth_user");
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} True se o usuário estiver autenticado
   */
  isAuthenticated() {
    if (typeof window === "undefined") return false;
    this.refreshToken(); // Atualiza o token se necessário

    const token = this.getToken();
    if (!token) return false;

    const { isValid } = this.verifyToken(token);
    return isValid;
  }

  /**
   * Remove os dados de autenticação do localStorage
   */
  logout() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    // Remover também o cookie
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Disparar um evento customizado para notificar mudança no estado de autenticação
    const event = new Event("authStateChanged");
    window.dispatchEvent(event);
  }

  /**
   * Atualiza o token JWT fazendo uma requisição para o endpoint de refresh
   * @returns {Promise<Object>} Resultado da operação contendo o novo token ou erro
   */
  async refreshToken() {
    try {
      // Verificar se existe um token atual
      const currentToken = this.getToken();
      if (!currentToken) {
        return {
          success: false,
          error: "Nenhum token disponível para refresh",
        };
      }

      // Verificar se o token está próximo de expirar (para prevenir refresh desnecessário)
      const tokenInfo = this.verifyToken(currentToken);
      if (tokenInfo.isValid) {
        const expiryTime = new Date(tokenInfo.decodedToken.exp * 1000);
        const now = new Date();
        const timeLeft = expiryTime - now;

        // Se ainda tiver mais de 5 minutos de validade, não é necessário atualizar
        if (timeLeft > 5 * 60 * 1000) {
          return {
            success: true,
            message: "Token ainda válido",
            token: currentToken,
            expiresAt: expiryTime.toLocaleString(),
          };
        }
      }

      // Fazer a chamada para o endpoint de refresh
      const response = await fetch("/api/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Falha ao atualizar token:", errorData);

        // Se o token for inválido ou expirado, faça logout
        if (response.status === 401) {
          this.logout();
          return {
            success: false,
            error: "Sessão expirada, faça login novamente",
          };
        }

        return {
          success: false,
          error: errorData.error || "Erro ao atualizar token",
          status: response.status,
        };
      }

      const data = await response.json();

      if (!data.token) {
        return { success: false, error: "Token não recebido do servidor" };
      }

      // Salvar o novo token
      const userData = this.getUserData();
      this.saveAuthData(data.token, userData);

      return {
        success: true,
        message: "Token atualizado com sucesso",
        token: data.token,
      };
    } catch (error) {
      console.error("Erro ao tentar atualizar o token:", error);
      return { success: false, error: "Erro na comunicação com o servidor" };
    }
  }
}

// Exporta uma instância única do serviço
const authService = new AuthService();
export default authService;
