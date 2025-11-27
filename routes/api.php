<?php
// routes/api.php

use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\AreaContactoController;
use App\Http\Controllers\ActividadController;
use Illuminate\Support\Facades\Route;

// Cambiar auth:sanctum por auth (sesiones tradicionales)
Route::middleware(['auth'])->group(function () {
    // Empresas
    Route::get('/empresas', [EmpresaController::class, 'index']);
    Route::post('/empresas', [EmpresaController::class, 'store']);
    Route::get('/empresas/{id}', [EmpresaController::class, 'show']);
    Route::put('/empresas/{id}', [EmpresaController::class, 'update']);
    Route::delete('/empresas/{id}', [EmpresaController::class, 'destroy']);
    
    // Contactos por área - RUTAS CORREGIDAS
    Route::get('/contactos', [AreaContactoController::class, 'index']);
    Route::post('/contactos', [AreaContactoController::class, 'store']);
    Route::get('/contactos/{id}', [AreaContactoController::class, 'show']);
    Route::put('/contactos/{id}', [AreaContactoController::class, 'update']);
    Route::delete('/contactos/{id}', [AreaContactoController::class, 'destroy']);
    
    // RUTA ESPECÍFICA QUE BUSCA EL JAVASCRIPT - AGREGAR ESTA LÍNEA
    Route::get('/contactos/por-empresa/{empresaId}', [AreaContactoController::class, 'porEmpresa']);
    
    // Actividades
    Route::get('/actividades', [ActividadController::class, 'index']);
    Route::post('/actividades', [ActividadController::class, 'store']);
    Route::get('/actividades/{id}', [ActividadController::class, 'show']);
    Route::put('/actividades/{id}', [ActividadController::class, 'update']);
    Route::delete('/actividades/{id}', [ActividadController::class, 'destroy']);
});