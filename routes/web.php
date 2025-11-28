<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\AreaContactoController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\MainController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::get('/', function () {
    return view('login');
})->name('home');

// Rutas de login
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');

// Rutas protegidas
Route::middleware(['auth'])->group(function () {
    // Rutas principales de la aplicación
    Route::get('/rastros', [MainController::class, 'rastros'])->name('rastros');
    Route::get('/programacion', [MainController::class, 'programacion'])->name('programacion');
    Route::get('/actividades', [MainController::class, 'actividades'])->name('actividades');
    Route::get('/info-empresa', [MainController::class, 'infoEmpresa'])->name('info-empresa');
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Rutas API dentro del grupo de autenticación
    Route::prefix('api')->group(function () {
        // Empresas
        Route::get('/empresas', [EmpresaController::class, 'index']);
        Route::post('/empresas', [EmpresaController::class, 'store']);
        Route::get('/empresas/{id}', [EmpresaController::class, 'show']);
        Route::put('/empresas/{id}', [EmpresaController::class, 'update']);
        Route::delete('/empresas/{id}', [EmpresaController::class, 'destroy']);
        
        // Contactos por área
        Route::get('/contactos', [AreaContactoController::class, 'index']);
        Route::post('/contactos', [AreaContactoController::class, 'store']);
        Route::get('/contactos/{id}', [AreaContactoController::class, 'show']);
        Route::put('/contactos/{id}', [AreaContactoController::class, 'update']);
        Route::delete('/contactos/{id}', [AreaContactoController::class, 'destroy']);
        Route::get('/empresas/{empresaId}/contactos', [AreaContactoController::class, 'porEmpresa']);
        
        // RUTA ESPECÍFICA QUE BUSCA EL JAVASCRIPT - AGREGAR ESTA LÍNEA
        Route::get('/contactos/por-empresa/{empresaId}', [AreaContactoController::class, 'porEmpresa']);
        
        // Actividades
        Route::get('/actividades', [ActividadController::class, 'index']);
        Route::post('/actividades', [ActividadController::class, 'store']);
        Route::get('/actividades/{id}', [ActividadController::class, 'show']);
        Route::put('/actividades/{id}', [ActividadController::class, 'update']);
        Route::delete('/actividades/{id}', [ActividadController::class, 'destroy']);
    });
});

// Ruta de prueba para guardado
Route::get('/test-guardado', function() {
    try {
        // Probar guardado de empresa
        $empresa = new \App\Models\Empresa();
        $empresa->nombre = 'Empresa Test ' . now()->format('Y-m-d H:i:s');
        $empresa->giro = 'Giros varios';
        $empresa->direccion = 'Dirección test';
        $empresa->contacto = 'Contacto test';
        $empresa->telefono = '123456789';
        $empresa->save();
        
        return "✅ Empresa de prueba guardada en SQL Server con ID: " . $empresa->id;
    } catch (\Exception $e) {
        return "❌ Error: " . $e->getMessage();
    }
});