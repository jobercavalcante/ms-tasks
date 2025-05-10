# Tasks Microservice - Documentação

Este documento contém as instruções para execução e detalhes do microsserviço de tarefas (task-service).

## Índice

1. [Arquitetura do Projeto](#arquitetura-do-projeto)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
6. [Rotas da API](#rotas-da-api)
7. [Autenticação](#autenticação)
8. [Testes](#testes)
9. [Swagger/Documentação da API](#swagger--documentação-da-api)
10. [Comunicação entre Microsserviços](#comunicação-entre-microsserviços)
11. [Frontend](#frontend)
12. [Manutenção e Suporte](#manutenção-e-suporte)

## Arquitetura do Projeto

O projeto segue uma arquitetura de microsserviços, sendo composto por:

- **Auth Service**: Responsável pela autenticação e gerenciamento de usuários
- **Task Service**: Responsável pelo gerenciamento de tarefas
- **Frontend**: Interface de usuário desenvolvida com Next.js que interage com os serviços de backend

Os serviços de backend são desenvolvidos com Laravel 12 e comunicam-se através de tokens JWT. O frontend atua como cliente, consumindo as APIs e fornecendo uma interface amigável para os usuários.

### Auth Service Detalhado

O microsserviço de autenticação (auth-service) gerencia todos os aspectos relacionados à identidade dos usuários:

#### Funcionalidades Principais

- Registro de novos usuários
- Autenticação (login/logout)
- Geração e validação de tokens JWT

#### Tecnologias Utilizadas

- Laravel 12
- Banco de dados MySQL
- JWT (JSON Web Tokens) via pacote tymon/jwt-auth
- Swagger para documentação da API

#### Estrutura de Código

- `app/Http/Controllers/AuthController.php`: Gerencia endpoints de autenticação
- `app/Http/Requests/StoreUserRequest.php`: Validação de dados para criação de usuários
- `app/Models/User.php`: Modelo de dados do usuário
- `config/jwt.php`: Configurações do JWT

### Task Service Detalhado

O microsserviço de tarefas (task-service) gerencia o ciclo de vida das tarefas dos usuários:

#### Funcionalidades Principais

- Criação, leitura, atualização e exclusão (CRUD) de tarefas
- Filtragem e pesquisa de tarefas
- Validação de permissões baseadas no token JWT

#### Tecnologias Utilizadas

- Laravel 12
- Banco de dados MySQL
- Validação de JWT compartilhando a mesma chave secreta do Auth Service
- Swagger para documentação da API

#### Estrutura de Código

- `app/Http/Controllers/TaskController.php`: Gerencia endpoints de tarefas
- `app/Http/Requests/StoreTaskRequest.php`: Validação de dados para criação de tarefas
- `app/Models/Task.php`: Modelo de dados da tarefa
- `app/Http/Middleware/JwtMiddleware.php`: Middleware de validação do token JWT

### Frontend Detalhado

A interface de usuário (frontend) é implementada com tecnologias modernas da web:

#### Funcionalidades Principais

- Interface responsiva para gerenciamento de tarefas
- Autenticação de usuários via JWT
- Sistema de refresh token para manter sessões ativas
- Proxy de API para comunicação com os microserviços de backend

#### Tecnologias Utilizadas

- Next.js 14 com App Router
- React 18
- CSS Modules para estilos isolados
- JWT para autenticação e autorização
- Axios para requisições HTTP

#### Estrutura de Código

- `app/`: Páginas e rotas usando o sistema de App Router do Next.js
- `app/api/`: Endpoints de API que atuam como proxy para os microsserviços
- `components/`: Componentes React reutilizáveis
- `services/`: Serviços para lógica de negócios e comunicação com APIs
- `services/authService.js`: Gerenciamento de autenticação e tokens JWT

## Pré-requisitos

- PHP 8.2 ou superior
- Composer
- MySQL 8.0 ou superior
- Servidor Web (Apache, Nginx) ou servidor embutido do Laravel

## Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd tasks-ms
```

### 2. Configure o Auth Service

```bash
cd auth-service
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
```

### 3. Configure o Task Service

```bash
cd ../task-service
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
```

### 4. Configure o arquivo .env do Task Service

Importante: O arquivo .env do Task Service deve conter a mesma chave JWT_SECRET que está configurada no Auth Service, para que a validação dos tokens funcione corretamente.

```
JWT_SECRET=chave_do_auth_service
```

### 5. Inicie os Serviços

Em terminais separados:

```bash
# Terminal 1 - Auth Service
cd auth-service
php artisan serve --port=8000

# Terminal 2 - Task Service
cd task-service
php artisan serve --port=8080

# Terminal 3 - Frontend (Next.js)
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

Cada parte do sistema requer variáveis de ambiente específicas para funcionar corretamente. Abaixo estão as variáveis necessárias para cada serviço:

### Auth Service (.env)

```dotenv
APP_NAME="Auth Service"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=auth_service_db
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=sua_chave_secreta_jwt
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_BLACKLIST_ENABLED=true
```

### Task Service (.env)

```dotenv
APP_NAME="Task Service"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_service_db
DB_USERNAME=root
DB_PASSWORD=

# Deve ser o mesmo do Auth Service
JWT_SECRET=sua_chave_secreta_jwt
```

### Frontend (Next.js)

Variáveis públicas (acessíveis pelo cliente) em `.env.local`:

```dotenv
NEXT_PUBLIC_APP_NAME="Task Management System"
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Variáveis de servidor (somente servidor) em `.env.local`, está 127.0.0.1 por conta que no next ele tenta acessar como ipv6 se tiver localhost:

```dotenv
AUTH_API_URL=http://127.0.0.1:8000/api
TASK_API_URL=http://127.0.0.1:8080/api
```

## Estrutura do Banco de Dados

### Users (Auth Service)

| Campo      | Tipo         | Descrição                       |
| ---------- | ------------ | ------------------------------- |
| id         | bigint       | Identificador único (PK)        |
| name       | varchar(255) | Nome completo do usuário        |
| email      | varchar(255) | Email do usuário (único)        |
| password   | varchar(255) | Senha criptografada             |
| profile    | varchar(20)  | Perfil do usuário (admin, user) |
| created_at | timestamp    | Data de criação                 |
| updated_at | timestamp    | Data de atualização             |

### Tasks (Task Service)

| Campo       | Tipo         | Descrição                                            |
| ----------- | ------------ | ---------------------------------------------------- |
| id          | bigint       | Identificador único (PK)                             |
| title       | varchar(255) | Título da tarefa                                     |
| description | text         | Descrição da tarefa (opcional)                       |
| status      | varchar(20)  | Status da tarefa (pendente, em_progresso, concluida) |
| user_id     | bigint       | ID do usuário proprietário da tarefa                 |
| created_at  | timestamp    | Data de criação                                      |
| updated_at  | timestamp    | Data de atualização                                  |

## Rotas da API

### Auth Service (http://localhost:8000)

| Método | Endpoint           | Descrição                            | Autenticação |
| ------ | ------------------ | ------------------------------------ | ------------ |
| POST   | /api/register      | Registra um novo usuário             | Não          |
| POST   | /api/login         | Autentica um usuário e retorna token | Não          |
| POST   | /api/logout        | Invalida o token do usuário          | Sim          |
| GET    | /api/me            | Obtém os dados do usuário atual      | Sim          |
| POST   | /api/refresh-token | Atualiza o token de autenticação     | Sim          |

### Task Service (http://localhost:8080)

| Método | Endpoint        | Descrição                               | Autenticação |
| ------ | --------------- | --------------------------------------- | ------------ |
| GET    | /api/tasks      | Lista todas as tarefas do usuário       | Sim          |
| GET    | /api/tasks/{id} | Obtém uma tarefa específica             | Sim          |
| POST   | /api/tasks      | Cria uma nova tarefa                    | Sim          |
| PUT    | /api/tasks/{id} | Atualiza uma tarefa existente           | Sim          |
| DELETE | /api/tasks/{id} | Remove uma tarefa                       | Sim          |
| GET    | /api/me         | Informações do usuário atual (do token) | Sim          |

### Frontend API Endpoints (Next.js)

| Método | Endpoint      | Descrição                          | Autenticação |
| ------ | ------------- | ---------------------------------- | ------------ |
| POST   | /api/login    | Autentica um usuário via backend   | Não          |
| POST   | /api/logout   | Invalida o token do usuário        | Sim          |
| POST   | /api/refresh  | Atualiza o token JWT expirado      | Sim          |
| POST   | /api/task     | Proxy para o Task Service          | Sim          |
| GET    | /api/task     | Proxy para listar tarefas          | Sim          |
| GET    | /api/task/:id | Proxy para obter tarefa específica | Sim          |
| PUT    | /api/task/:id | Proxy para atualizar tarefa        | Sim          |
| DELETE | /api/task/:id | Proxy para remover tarefa          | Sim          |

## Autenticação

O microsserviço usa autenticação via JWT (JSON Web Token). Para acessar rotas protegidas:

1. Obtenha um token no Auth Service através do endpoint `/api/login`
2. Adicione o token ao header das requisições ao Task Service:
   ```
   Authorization: Bearer seu_token_jwt_aqui
   ```

O Task Service valida o token sem consultar o serviço de autenticação, extraindo as informações necessárias diretamente do payload do JWT.

### Sistema de Refresh Token

O projeto implementa um mecanismo de refresh token para manter a sessão do usuário sem necessidade de nova autenticação:

1. Quando o token JWT está próximo de expirar (menos de 5 minutos de validade), o frontend solicita automaticamente um novo token
2. O endpoint `/api/refresh-token` do frontend faz uma requisição para o backend de autenticação
3. O backend valida o token atual e gera um novo token JWT
4. O novo token é armazenado no frontend e usado para requisições subsequentes

Este mecanismo é implementado no serviço `authService.js` do frontend, que:

- Verifica a validade do token antes de operações importantes
- Solicita automaticamente um novo token quando necessário
- Gerencia o armazenamento seguro do token no localStorage e cookies

## Testes

### Auth Service

Para executar os testes do Auth Service:

```bash
cd auth-service
php artisan test
```

#### Testes de Feature

Arquivo: `tests/Feature/StoreUserRequestTest.php`

Estes testes verificam o comportamento dos endpoints de registro e autenticação:

- **test_register_requires_name**: Valida que o campo nome é obrigatório
- **test_register_requires_valid_email**: Valida o formato do email
- **test_register_requires_unique_email**: Verifica que emails duplicados são rejeitados
- **test_register_requires_password_min_length**: Testa o tamanho mínimo da senha
- **test_register_successful_with_valid_data**: Verifica o registro bem-sucedido

#### Testes Unitários

Arquivo: `tests/Unit/StoreUserRequestTest.php`

Estes testes validam as regras de negócio para criação de usuários:

- **test_rules_contem_campos_obrigatorios**: Verifica campos obrigatórios
- **test_email_deve_ser_unico**: Confirma validação de email único
- **test_senha_deve_ter_minimo_caracteres**: Verifica tamanho mínimo da senha
- **test_messages_retorna_mensagens_de_erro_personalizadas**: Testa mensagens personalizadas
- **test_authorize_retorna_true**: Verifica permissão de acesso
- **test_failed_validation_lanca_exception**: Testa exceções de validação

### Task Service

Para executar os testes do Task Service:

```bash
cd task-service
php artisan test
```

#### Testes de Feature

Arquivo: `tests/Feature/TasksTest.php`

Estes testes verificam o comportamento dos endpoints da API em um contexto de requisição HTTP. Incluem:

- **test_can_list_tasks**: Verifica se é possível listar todas as tarefas do usuário.
- **test_tasks_requires_authentication**: Confirma que as rotas exigem autenticação.
- **test_can_create_task**: Testa a criação de uma nova tarefa.
- **test_task_requires_title**: Valida que o campo título é obrigatório.
- **test_can_view_task**: Verifica a visualização de uma tarefa específica.
- **test_can_update_task**: Testa a atualização de uma tarefa existente.
- **test_can_delete_task**: Verifica a remoção de uma tarefa.

#### Testes Unitários

Arquivo: `tests/Unit/StoreTaskRequestTest.php`

Estes testes focam na validação das regras de negócio em nível de componente. Incluem:

- **test_rules_contem_campos_obrigatorios**: Verifica as regras de validação dos campos.
- **test_title_tem_tamanho_maximo**: Testa limite de tamanho do título.
- **test_description_pode_ser_nulo**: Verifica que descrição é opcional.
- **test_messages_retorna_mensagens_de_erro_personalizadas**: Testa mensagens de erro personalizadas.
- **test_validacao_falha_com_dados_invalidos**: Confirma falha na validação com dados inválidos.
- **test_validacao_passa_com_dados_validos**: Verifica validação de dados corretos.
- **test_authorization_retorna_verdadeiro**: Testa permissão de acesso.
- **test_failed_validation_lanca_exception**: Verifica se exceção é lançada em caso de erro.

### Simulação de Autenticação JWT

Os testes de feature utilizam a biblioteca Firebase JWT para gerar tokens de autenticação válidos. Isso permite testar rotas protegidas sem depender do serviço de autenticação.

## Swagger / Documentação da API

O projeto utiliza L5-Swagger para documentação automática da API. Para acessar:

1. Gere a documentação:

   ```bash
   php artisan l5-swagger:generate
   ```

2. Acesse a documentação:
   - Auth Service: http://localhost:8000/api/documentation
   - Task Service: http://localhost:8080/api/documentation

### Anotações Swagger

#### Auth Service

O Auth Service utiliza anotações OpenAPI para documentar suas APIs:

- **Controllers**: O `AuthController.php` contém anotações `@OA\Tag` e cada método tem anotações `@OA\Post`, `@OA\Get` etc., descrevendo as operações.
- **Modelos de Requisição**: O `StoreUserRequest.php` utiliza `@OA\Schema` para documentar o formato de dados esperado no registro.
- **Respostas**: Anotações `@OA\Response` documentam os possíveis códigos de retorno e suas estruturas JSON.

Exemplo de anotação no Auth Service:

```php
/**
 * @OA\Post(
 *     path="/api/register",
 *     tags={"Autenticação"},
 *     summary="Registra um novo usuário",
 *     @OA\RequestBody(
 *         @OA\JsonContent(ref="#/components/schemas/StoreUserRequest")
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Usuário criado com sucesso",
 *         @OA\JsonContent(...)
 *     )
 * )
 */
```

#### Task Service

O Task Service também utiliza anotações OpenAPI para documentar suas APIs:

- **Controllers**: O `TaskController.php` contém anotações para cada endpoint da API.
- **Modelos de Dados**: Classes como `Task.php` utilizam `@OA\Schema` para documentar a estrutura dos dados.
- **Middleware**: O middleware JWT possui anotações para documentar o esquema de segurança.

Exemplo de anotação no Task Service:

```php
/**
 * @OA\Get(
 *     path="/api/tasks",
 *     tags={"Tarefas"},
 *     summary="Lista todas as tarefas do usuário autenticado",
 *     security={{"bearerAuth":{}}},
 *     @OA\Response(
 *         response=200,
 *         description="Lista de tarefas recuperada com sucesso",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Task")
 *         )
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Não autorizado - Token inválido ou expirado"
 *     )
 * )
 */
```

#### Swagger Info Configuration

Ambos os serviços configuram informações básicas da API através da anotação `@OA\Info` no controlador principal:

```php
/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="API de Tarefas",
 *     description="API para gerenciamento de tarefas do usuário",
 *     @OA\Contact(
 *         name="Equipe de Desenvolvimento",
 *         email="dev@example.com"
 *     )
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
```

### Como usar a documentação Swagger

A documentação Swagger oferece uma interface interativa para testar os endpoints da API tanto no Auth Service quanto no Task Service:

#### Acessando a documentação

1. **Auth Service**:

   - Inicie o serviço: `cd auth-service && php artisan serve --port=8000`
   - Acesse no navegador: `http://localhost:8000/api/documentation`

2. **Task Service**:
   - Inicie o serviço: `cd task-service && php artisan serve --port=8080`
   - Acesse no navegador: `http://localhost:8080/api/documentation`

#### Usando a interface do Swagger

1. **Autenticação**:

   - Clique no botão "Authorize" no topo da página Swagger
   - Insira seu token JWT no formato `Bearer {seu_token}`
   - Clique em "Authorize" para usar este token em todas as solicitações

2. **Testando endpoints**:

   - Expanda um endpoint clicando nele
   - Preencha os parâmetros necessários
   - Clique em "Try it out" para enviar a solicitação
   - Veja a resposta completa, incluindo status HTTP e corpo

3. **Exemplos de modelos**:
   - A seção "Schemas" na parte inferior da página mostra a estrutura esperada para cada modelo de dados
   - Útil para entender quais campos são obrigatórios e seus tipos

#### Fluxo de trabalho recomendado

1. Primeiro obtenha um token no Auth Service através do endpoint `/api/login`
2. Copie o token da resposta e use-o para autenticar no Swagger do Task Service
3. Agora você pode testar todos os endpoints protegidos no Task Service

## Comunicação entre Microsserviços

A comunicação entre os serviços é realizada de forma assíncrona através de tokens JWT. O Auth Service é responsável por gerar tokens de acesso, enquanto o Task Service valida esses tokens e extrai as informações necessárias para autorizar as requisições.

### Payload do JWT

O payload do token contém:

- `sub`: ID do usuário
- `name`: Nome do usuário
- `email`: Email do usuário
- `profile`: Perfil do usuário
- `permissions`: Array com as permissões do usuário
- `iat`, `exp`, `nbf`: Timestamps de emissão, expiração e "não antes de"

### Implementação do JWT no Auth Service

O Auth Service utiliza o pacote `tymon/jwt-auth` para implementar a autenticação JWT:

1. **Geração de Token**: No controller `AuthController.php`, o método `login()` gera um novo token JWT após autenticar o usuário.
2. **Modelo JWT**: A classe `User.php` implementa a interface `JWTSubject` com dois métodos:

   - `getJWTIdentifier()`: Retorna a chave primária do usuário
   - `getJWTCustomClaims()`: Adiciona claims personalizadas ao token (nome, email, perfil, permissões)

3. **Configurações**: O arquivo `config/jwt.php` contém todas as configurações do JWT, incluindo tempo de expiração, algoritmo de assinatura e chaves secretas.

### Validação no Task Service

O Task Service utiliza um middleware personalizado que:

1. Extrai o token do header da requisição
2. Verifica a validade da assinatura usando a mesma chave secreta
3. Valida as datas de expiração
4. Extrai as informações do usuário e as disponibiliza para os controllers

## Frontend

O frontend do projeto é desenvolvido utilizando Next.js 14, uma moderna framework React com recursos de Server-Side Rendering (SSR) e API Routes.

### Arquitetura do Frontend

- **App Router**: Utiliza o novo sistema de roteamento baseado em pastas do Next.js 14
- **API Routes**: Implementa endpoints no diretório `/app/api/*` que atuam como proxy para os microsserviços
- **Componentes Cliente**: Utiliza a diretiva "use client" para componentes interativos executados no navegador

### Principais Componentes

- **AuthService**: Serviço que gerencia autenticação, tokens JWT e sessão do usuário
- **LogoutButton**: Componente de UI que realiza logout e redireciona o usuário
- **AuthStatusProvider**: Componente que verifica status de autenticação e renderiza componentes condicionalmente

### Estrutura de Diretórios

- **/app**: Contém as páginas e layouts da aplicação usando App Router
- **/app/api**: Endpoints de API que se comunicam com os microsserviços
- **/components**: Componentes React reutilizáveis
- **/services**: Serviços de lógica de negócio e comunicação com a API

### Fluxo de Autenticação

1. O usuário preenche o formulário de login na página inicial
2. Os dados são enviados ao endpoint `/api/login`
3. A API proxy encaminha a solicitação para o Auth Service
4. O token JWT retornado é armazenado no localStorage e em cookies
5. Um sistema de eventos personalizado notifica os componentes sobre a mudança no estado de autenticação
6. O usuário é redirecionado para o dashboard

### Layout Responsivo

O frontend implementa um layout totalmente responsivo usando:

- CSS Modules para estilos encapsulados
- Media queries para adaptar a interface a diferentes tamanhos de tela
- Estratégia Mobile-first para garantir boa experiência em dispositivos móveis

## Manutenção e Suporte
