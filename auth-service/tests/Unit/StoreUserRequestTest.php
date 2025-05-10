<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreUserRequestTest extends TestCase
{
    protected StoreUserRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new StoreUserRequest();
    }

    public function test_rules_contem_campos_obrigatorios()
    {
        $rules = $this->request->rules();

        $this->assertArrayHasKey('name', $rules);
        $this->assertArrayHasKey('email', $rules);
        $this->assertArrayHasKey('password', $rules);

        $this->assertStringContainsString('required', $rules['name']);
        $this->assertStringContainsString('required', $rules['email']);
        $this->assertStringContainsString('required', $rules['password']);
    }

    public function test_email_deve_ser_unico()
    {
        $rules = $this->request->rules();

        $this->assertStringContainsString('unique:users', $rules['email']);
    }

    public function test_senha_deve_ter_minimo_caracteres()
    {
        $rules = $this->request->rules();

        $this->assertStringContainsString('min:6', $rules['password']);
    }

    public function test_messages_retorna_mensagens_de_erro_personalizadas()
    {
        $messages = $this->request->messages();

        $this->assertIsArray($messages);
        $this->assertArrayHasKey('name.required', $messages);
        $this->assertArrayHasKey('email.required', $messages);
        $this->assertArrayHasKey('password.required', $messages);
        $this->assertArrayHasKey('email.unique', $messages);
    }

    public function test_authorize_retorna_true()
    {
        $this->assertTrue($this->request->authorize());
    }

    public function test_failed_validation_lanca_exception()
    {
        $this->expectException(HttpResponseException::class);

        $validator = Validator::make(
            ['name' => ''], // Dados inválidos
            ['name' => 'required']
        );

        $method = new \ReflectionMethod(StoreUserRequest::class, 'failedValidation');
        $method->setAccessible(true);
        $method->invoke($this->request, $validator);
    }
}
