<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\StoreTaskRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreTaskRequestTest extends TestCase
{
    protected StoreTaskRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new StoreTaskRequest();
    }

    public function test_rules_contem_campos_obrigatorios()
    {
        $rules = $this->request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('description', $rules);

        $this->assertStringContainsString('required', $rules['title']);
    }

    public function test_title_tem_tamanho_maximo()
    {
        $rules = $this->request->rules();

        $this->assertStringContainsString('max:255', $rules['title']);
    }

    public function test_description_pode_ser_nulo()
    {
        $rules = $this->request->rules();

        $this->assertStringContainsString('nullable', $rules['description']);
    }

    public function test_messages_retorna_mensagens_de_erro_personalizadas()
    {
        $messages = $this->request->messages();

        $this->assertIsArray($messages);
        $this->assertArrayHasKey('title.required', $messages);
        $this->assertArrayHasKey('title.string', $messages);
        $this->assertArrayHasKey('title.max', $messages);
        $this->assertArrayHasKey('description.string', $messages);
    }

    public function test_validacao_falha_com_dados_invalidos()
    {
        $validator = Validator::make(
            ['description' => 'Descrição sem título'], // Falta o campo title obrigatório
            $this->request->rules(),
            $this->request->messages()
        );

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('title'));
    }

    public function test_validacao_passa_com_dados_validos()
    {
        $validator = Validator::make(
            [
                'title' => 'Título da Tarefa',
                'description' => 'Descrição da tarefa'
            ],
            $this->request->rules(),
            $this->request->messages()
        );

        $this->assertFalse($validator->fails());
    }

    public function test_authorization_retorna_verdadeiro()
    {
        $this->assertTrue($this->request->authorize());
    }

    public function test_failed_validation_lanca_exception()
    {
        $this->expectException(HttpResponseException::class);

        $validator = Validator::make(
            ['title' => ''], // Dados inválidos
            ['title' => 'required']
        );

        $method = new \ReflectionMethod(StoreTaskRequest::class, 'failedValidation');
        $method->setAccessible(true);
        $method->invoke($this->request, $validator);
    }
}
