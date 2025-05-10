<?php

use App\Http\Controllers\TasksController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas públicas
Route::get('/teste', function (Request $request) {
    return response('ola');
});

// Rotas protegidas pelo middleware JWT
Route::middleware('jwt.verify')->group(function () {

    Route::get('/me', function (Request $request) {
        return response()->json($request->auth);
    });

    Route::post('/tasks', [TasksController::class, 'store'])->name('tasks.store');
    Route::get('/tasks', [TasksController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/{id}', [TasksController::class, 'show'])->name('tasks.show');
    Route::put('/tasks/{id}', [TasksController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{id}', [TasksController::class, 'destroy'])->name('tasks.destroy');
});
