<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class StoreUserRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_requires_name()
    {
        $response = $this->postJson('/api/register', [
            'email' => 'teste@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_register_requires_valid_email()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Teste',
            'email' => 'email-invalido',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_register_requires_unique_email()
    {
        // Criar um usuário com este email
        User::factory()->create([
            'email' => 'existente@example.com'
        ]);

        // Tentar registrar com o mesmo email
        $response = $this->postJson('/api/register', [
            'name' => 'Novo Usuário',
            'email' => 'existente@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email')
            ->assertJsonFragment(['email' => ['Este email já está sendo utilizado.']]);
    }

    public function test_register_requires_password_min_length()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Teste',
            'email' => 'teste@example.com',
            'password' => '123', // Senha muito curta
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    public function test_register_successful_with_valid_data()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Usuário Válido',
            'email' => 'valido@example.com',
            'password' => 'senha123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email']
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'valido@example.com'
        ]);
    }
}
