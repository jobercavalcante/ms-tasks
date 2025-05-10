<?php

namespace App\Http;

/**
 * @OA\Info(
 *     title="API de Tarefas",
 *     version="1.0.0",
 *     description="Microsserviço de gerenciamento de tarefas que usa JWT para autenticação"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8080",
 *     description="Servidor de Tarefas Local"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 *
 * @OA\Schema(
 *     schema="Tasks",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="Completar relatório do projeto"),
 *     @OA\Property(property="description", type="string", example="Finalizar o relatório trimestral do projeto com métricas"),
 *     @OA\Property(property="status", type="string", example="pendente"),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z")
 * )
 *
 * @OA\Schema(
 *     schema="Error",
 *     @OA\Property(property="message", type="string", example="O token fornecido é inválido"),
 *     @OA\Property(property="status", type="string", example="error")
 * )
 *
 * @OA\Tag(
 *     name="Tasks",
 *     description="Operações relacionadas a tarefas"
 * )
 *
 * @OA\Tag(
 *     name="Auth",
 *     description="Operações relacionadas a autenticação"
 * )
 */
class SwaggerInfo
{
    // Esta classe existe apenas para documentação do Swagger
}
