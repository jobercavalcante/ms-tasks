// Arquivo de configuração para acessar variáveis de ambiente
const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Sistema de Tarefas",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",

  // Variáveis acessíveis apenas no lado do servidor
  server: {
    authApiUrl: process.env.AUTH_API_URL,
    taskApiUrl: process.env.TASK_API_URL,
    jwtSecret: process.env.JWT_SECRET,
  },
};

export default config;
