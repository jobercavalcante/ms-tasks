<?php

namespace App\Http;

/**
 * @OA\Info(
 *     title="API de Autenticação",
 *     version="1.0.0",
 *     description="API para autenticação de usuários usando JWT. Para usar as rotas protegidas, primeiro faça login para obter um token JWT e depois use esse token no header de autorização.",
 *     @OA\Contact(
 *         email="contato@example.com",
 *         name="Suporte API"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Servidor Local"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Use o token JWT obtido na rota de login. Adicione 'Bearer ' antes do token (exemplo: 'Bearer eyJ0eXA...')"
 * )
 */
class SwaggerInfo
{
    // Esta classe existe apenas para documentação do Swagger
}
