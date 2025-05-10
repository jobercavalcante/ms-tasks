<?php

namespace Tests\Feature;

use App\Models\Tasks;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Firebase\JWT\JWT;

class TasksTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        // Cria um token JWT válido para autenticação
        $this->token = $this->generateJwtToken();
    }

    /**
     * Gera um token JWT válido para testes
     */
    protected function generateJwtToken()
    {
        $payload = [
            'sub' => 1, // ID do usuário fictício
            'name' => 'Usuário Teste',
            'email' => 'teste@example.com',
            'profile' => 'user',
            'permissions' => ['read', 'create', 'update'],
            'iat' => time(),
            'exp' => time() + 3600,
            'nbf' => time(),
            'iss' => 'http://localhost:8000'
        ];

        $secret = env('JWT_SECRET', 'default_secret_for_testing');
        return JWT::encode($payload, $secret, 'HS256');
    }

    /**
     * Testa se consegue listar tarefas
     */
    public function test_can_list_tasks(): void
    {
        // Cria algumas tarefas para o teste
        Tasks::create([
            'title' => 'Tarefa de Teste 1',
            'description' => 'Descrição da tarefa 1',
            'user_id' => 1,
            'status' => 'pendente'
        ]);

        Tasks::create([
            'title' => 'Tarefa de Teste 2',
            'description' => 'Descrição da tarefa 2',
            'user_id' => 1,
            'status' => 'em_progresso'
        ]);

        // Faz a requisição autenticada
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/tasks');

        // Verifica se a resposta foi bem-sucedida e contém as tarefas
        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => ['id', 'title', 'description', 'user_id', 'status', 'created_at', 'updated_at']
            ]);
    }

    /**
     * Testa se retorna erro quando não autenticado
     */
    public function test_tasks_requires_authentication(): void
    {
        // Faz requisição sem token
        $response = $this->getJson('/api/tasks');

        // Verifica se retornou erro de não autenticado
        $response->assertStatus(401);
    }

    /**
     * Testa se pode criar uma nova tarefa
     */
    public function test_can_create_task(): void
    {
        $taskData = [
            'title' => 'Nova Tarefa',
            'description' => 'Descrição da nova tarefa'
        ];

        // Faz a requisição autenticada para criar tarefa
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/tasks', $taskData);

        // Verifica se a resposta foi bem-sucedida e a tarefa foi criada
        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'title',
                'description',
                'user_id',
                'created_at',
                'updated_at'
            ])
            ->assertJson([
                'title' => 'Nova Tarefa',
                'description' => 'Descrição da nova tarefa',
                'user_id' => 1
            ]);

        // Verifica se a tarefa existe no banco de dados
        $this->assertDatabaseHas('tasks', [
            'title' => 'Nova Tarefa',
            'description' => 'Descrição da nova tarefa'
        ]);
    }

    /**
     * Testa se a validação de campo obrigatório funciona
     */
    public function test_task_requires_title(): void
    {
        $taskData = [
            'description' => 'Descrição sem título'
        ];

        // Faz a requisição autenticada sem o título obrigatório
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/tasks', $taskData);

        // Verifica se retornou erro de validação
        $response->assertStatus(422)
            ->assertJsonValidationErrors('title');
    }

    /**
     * Testa se consegue visualizar uma tarefa específica
     */
    public function test_can_view_task(): void
    {
        // Cria uma tarefa para o teste
        $task = Tasks::create([
            'title' => 'Tarefa para Visualizar',
            'description' => 'Descrição da tarefa para visualizar',
            'user_id' => 1,
            'status' => 'pendente'
        ]);

        // Faz a requisição autenticada com título (requisito do controller)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/tasks/' . $task->id . '?title=Tarefa para Visualizar');

        // Verifica se a resposta foi bem-sucedida e contém os dados da tarefa
        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'title',
                'description',
                'user_id',
                'status',
                'created_at',
                'updated_at'
            ])
            ->assertJson([
                'id' => $task->id,
                'title' => 'Tarefa para Visualizar',
                'description' => 'Descrição da tarefa para visualizar'
            ]);
    }

    /**
     * Testa se consegue atualizar uma tarefa
     */
    public function test_can_update_task(): void
    {
        // Cria uma tarefa para o teste
        $task = Tasks::create([
            'title' => 'Tarefa para Atualizar',
            'description' => 'Descrição da tarefa para atualizar',
            'user_id' => 1,
            'status' => 'pendente'
        ]);

        $updateData = [
            'title' => 'Tarefa Atualizada',
            'description' => 'Descrição atualizada',
            'status' => 'em_progresso'
        ];

        // Faz a requisição autenticada
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson('/api/tasks/' . $task->id, $updateData);

        // Verifica se a resposta foi bem-sucedida e contém os dados atualizados
        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Tarefa Atualizada',
                'description' => 'Descrição atualizada',
                'status' => 'em_progresso'
            ]);

        // Verifica se a tarefa foi atualizada no banco de dados
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Tarefa Atualizada',
            'description' => 'Descrição atualizada',
            'status' => 'em_progresso'
        ]);
    }

    /**
     * Testa se consegue excluir uma tarefa
     */
    public function test_can_delete_task(): void
    {
        // Cria uma tarefa para o teste
        $task = Tasks::create([
            'title' => 'Tarefa para Excluir',
            'description' => 'Descrição da tarefa para excluir',
            'user_id' => 1,
            'status' => 'pendente'
        ]);

        // Faz a requisição autenticada
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson('/api/tasks/' . $task->id);

        // Verifica se a resposta foi bem-sucedida
        $response->assertStatus(200);

        // Verifica se a tarefa foi removida do banco de dados
        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id
        ]);
    }
}
