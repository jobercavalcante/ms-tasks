<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {

        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token não fornecido'
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            // Obter a chave secreta do arquivo .env
            $secretKey = env('JWT_SECRET');

            if (!$secretKey) {
                throw new Exception('JWT_SECRET não está configurado');
            }

            // Usar Firebase JWT diretamente para decodificar o token
            $credentials = JWT::decode($token, new Key($secretKey, 'HS256'));


            $credentials->user_id = $credentials->sub ?? null;
            // Armazenar os dados do token na requisição para uso posterior
            $request->merge(
                ['auth' => (array)$credentials]
            );
        } catch (ExpiredException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token expirado'
            ], Response::HTTP_UNAUTHORIZED);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token inválido: ' . $e->getMessage()
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
