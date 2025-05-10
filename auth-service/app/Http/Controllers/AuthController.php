<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Autenticação",
 *     description="Endpoints de autenticação de usuários"
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Registrar um novo usuário",
     *     description="Cria um novo usuário e retorna um token JWT",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *             @OA\Property(property="name", type="string", example="João Silva"),
     *             @OA\Property(property="email", type="string", format="email", example="joao@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="senha123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuário criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *             @OA\Property(
     *                 property="user",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="João Silva"),
     *                 @OA\Property(property="email", type="string", example="joao@example.com"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erro de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function register(StoreUserRequest $request)
    {

        $request = $request->validated();

        $user = User::create([
            'name' => $request['name'],
            'email' => $request['email'],
            'password' => Hash::make($request['password']),
        ]);

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        // Decodifica o token para mostrar as informações
        $tokenParts = explode('.', $token);
        $payloadBase64 = $tokenParts[1];
        $decodedPayload = json_decode(base64_decode($payloadBase64));

        return response()->json([
            'token' => $token,
            'user' => $user,
            'token_info' => [
                'id_usuario' => $decodedPayload->sub,
                'nome' => $decodedPayload->name ?? null,
                'email' => $decodedPayload->email ?? null,
                'emitido_em' => date('d/m/Y H:i:s', $decodedPayload->iat),
                'expira_em' => date('d/m/Y H:i:s', $decodedPayload->exp),
            ]
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login de usuário",
     *     description="Autentica o usuário e retorna um token JWT",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="joao@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="senha123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login bem-sucedido",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *             @OA\Property(property="expires_in", type="integer", example=3600),
     *             @OA\Property(
     *                 property="user",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="João Silva"),
     *                 @OA\Property(property="email", type="string", example="joao@example.com"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciais inválidas",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Credenciais Invalidas")
     *         )
     *     )
     * )
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Credenciais Invalidas'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Não foi possivel gerar o token'], 500);
        }



        return response()->json([
            'token' => $token,
            'expires_in' => auth('api')->factory()->getTTL() * 60,

        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Logout de usuário",
     *     description="Invalida o token JWT atual. Este endpoint requer autenticação. Adicione o token JWT no header de autorização como: `Authorization: Bearer seu_token_aqui`",
     *     tags={"Autenticação"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout bem-sucedido",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Deslogado com sucesso")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado - Token ausente ou inválido",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Não autorizado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao fazer logout",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Erro ao deslogar, tente novamente")
     *         )
     *     )
     * )
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json(['error' => 'Erro ao deslogar, tente novamente'], 500);
        }

        return response()->json(['message' => 'Deslogado com sucesso']);
    }

    /**
     * @OA\Get(
     *     path="/api/me",
     *     summary="Obter dados do usuário atual",
     *     description="Retorna os dados do usuário autenticado. Este endpoint requer autenticação. Adicione o token JWT no header de autorização como: `Authorization: Bearer seu_token_aqui`",
     *     operationId="getUser",
     *     tags={"Autenticação"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Dados do usuário",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="João Silva"),
     *             @OA\Property(property="email", type="string", example="joao@example.com"),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado - Token ausente ou inválido",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Não autorizado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Usuário não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Usuário não encontrado")
     *         )
     *     )
     * )
     */
    public function getUser()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Usuário não encontrado'], 404);
            }
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Falha ao buscar o perfil do usuário'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/refresh",
     *     summary="Atualizar token JWT",
     *     description="Atualiza o token JWT para um novo token válido. Este endpoint requer autenticação. Adicione o token JWT no header de autorização como: `Authorization: Bearer seu_token_aqui`",
     *     operationId="refresh",
     *     tags={"Autenticação"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token atualizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGc..."),
     *             @OA\Property(property="expires_in", type="integer", example=3600)     *
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado - Token ausente ou inválido",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Não autorizado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao atualizar token",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Não foi possível atualizar o token")
     *         )
     *     )
     * )
     */
    public function refresh()
    {
        try {
            $token = JWTAuth::parseToken()->refresh();

            return response()->json([
                'token' => $token,
                'expires_in' => auth('api')->factory()->getTTL() * 60,

            ]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Não foi possível atualizar o token'], 500);
        }
    }
}
