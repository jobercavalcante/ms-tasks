<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Models\Tasks;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;


/**
 * @OA\Tag(
 *     name="Auth",
 *     description="Endpoints relacionados criação de tasks"
 * )
 */
class TasksController extends Controller
{

    /**
     * @OA\Get(
     *     path="/api/tasks",
     *     summary="Lista todas as tarefas",
     *     description="Retorna uma lista de todas as tarefas. Requer autenticação via token Bearer.",
     *     tags={"Tasks"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de tarefas retornada com sucesso",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Tasks"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado - Token de autenticação ausente ou inválido"
     *     ),
     * )
     */
    public function index(Request $request)
    {
        $tasks = Tasks::where('user_id', $request->auth['sub'])->get();
        return response()->json($tasks);
    }

    /**
     * Armazena uma tarefa recém-criada
     *
     * @OA\Post(
     *     path="/api/tasks",
     *     summary="Armazena uma nova tarefa",
     *     description="Cria uma nova tarefa com as informações fornecidas. Requer autenticação via token Bearer.",
     *     tags={"Tasks"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title"},
     *             @OA\Property(property="title", type="string", example="Completar relatório do projeto"),
     *             @OA\Property(property="description", type="string", example="Finalizar o relatório trimestral do projeto com métricas")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tarefa criada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="title", type="string", example="Completar relatório do projeto"),
     *             @OA\Property(property="description", type="string", example="Finalizar o relatório trimestral do projeto com métricas"),
     *             @OA\Property(property="status", type="string", example="pendente"),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erro de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Os dados fornecidos são inválidos."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(
     *                     property="title",
     *                     type="array",
     *                     @OA\Items(type="string", example="O campo título é obrigatório.")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado - Token de autenticação ausente ou inválido"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro no servidor"
     *     )
     * )
     */
    public function store(StoreTaskRequest $request)
    {
        $task = Tasks::create([
            'title' => $request->title,
            'description' => $request->description,
            'user_id' => $request->auth['sub'],
        ]);

        return response()->json($task, 201);
    }


    /**
     * @OA\Get(
     *     path="/api/tasks/{id}",
     *     summary="Exibe uma tarefa específica",
     *     description="Retorna os detalhes de uma tarefa específica. Requer autenticação via token Bearer.",
     *     tags={"Tasks"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID da tarefa",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes da tarefa retornados com sucesso",
     *         @OA\JsonContent(ref="#/components/schemas/Tasks")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tarefa não encontrada"
     *     ),
     * )
     */
    public function show(StoreTaskRequest $request, $id)
    {
        $userId = $request->auth['sub'];
        $task = Tasks::where('id', $id)->where('user_id', $userId)->first();
        if (!$task) {
            return response()->json(['message' => 'Task não encontrada'], 404);
        }

        return response()->json($task);
    }



    /**
     * @OA\Put(
     *     path="/api/tasks/{id}",
     *     summary="Atualiza uma tarefa específica",
     *     description="Atualiza os detalhes de uma tarefa específica. Requer autenticação via token Bearer.",
     *     tags={"Tasks"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID da tarefa",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title"},
     *             @OA\Property(property="title", type="string", example="Completar relatório do projeto"),
     *             @OA\Property(property="description", type="string", example="Finalizar o relatório trimestral do projeto com métricas"),
     *             @OA\Property(
     *                 property="status",
     *                 type="string",
     *                 description="Status da tarefa (pendente, em_progresso ou completado)",
     *                 example="completado|em_progresso|pendente",
     *                 enum={"pendente", "em_progresso", "completado"}
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tarefa atualizada com sucesso",
     *         @OA\JsonContent(ref="#/components/schemas/Tasks")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tarefa não encontrada"
     *     ),
     * )
     */
    public function update(Request $request, $id)
    {
        $userId = $request->auth['sub'];
        $task = Tasks::where('id', $id)->where('user_id', $userId)->first();
        if (!$task) {
            return response()->json(['message' => 'Task não encontrada'], 404);
        }
        $task->update($request->only(['title', 'description', 'status']));

        return response()->json($task);
    }

    /**
     * @OA\Delete(
     *     path="/api/tasks/{id}",
     *     summary="Deleta uma tarefa específica",
     *     description="Remove uma tarefa específica. Requer autenticação via token Bearer.",
     *     tags={"Tasks"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID da tarefa",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tarefa deletada com sucesso"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Tarefa não encontrada"
     *     ),
     * )
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->auth['sub'];
        $task = Tasks::where('id', $id)->where('user_id', $userId)->first();
        if (!$task) {
            return response()->json(['message' => 'Task não encontrada'], 404);
        }

        $task->delete();
        return response()->json(['message' => 'Task deletada com sucesso']);
    }
}
