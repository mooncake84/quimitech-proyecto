<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MainController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\AreaContactoController;
use App\Http\Controllers\EmpresaAreaController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\ClienteController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// ============================
// RUTAS PÚBLICAS
// ============================
Route::get('/', function () {
    return view('login');
})->name('home');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');

// ============================
// RUTAS PROTEGIDAS
// ============================
Route::middleware('auth')->group(function () {

    // Vistas principales
    Route::get('/rastros', [MainController::class, 'rastros'])->name('rastros');
    Route::get('/programacion', [MainController::class, 'programacion'])->name('programacion');
    Route::get('/actividades', [MainController::class, 'actividades'])->name('actividades');
    Route::get('/info-empresa', [MainController::class, 'infoEmpresa'])->name('info-empresa');

    // Empresas
    Route::get('/empresas/registro', fn () => view('empresas.create'))->name('empresas.create');

    Route::get('/empresas/{id}/areas', function ($id) {
        return view('empresas.areas', ['empresaId' => $id]);
    })->name('empresas.areas');

    Route::get('/info-empresa/empresa-no-encontrada', fn () =>
        view('empresa_no_encontrada')
    )->name('empresa.no-encontrada');

    // Clientes (vista) - NUEVA RUTA
    Route::get('/clientes', fn () => view('clientes'))->name('clientes.index');

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ============================
    // API (PROTEGIDA)
    // ============================
    Route::prefix('api')->group(function () {

        // -------- EMPRESAS --------
        Route::get('/empresas/buscar', [EmpresaController::class, 'buscar']);
        Route::get('/empresas/estadisticas', [EmpresaController::class, 'estadisticas']);
        Route::get('/empresas/health', [EmpresaController::class, 'health']);
        Route::get('/empresas/{id}/info-general', [EmpresaController::class, 'getInfoGeneral']);
        Route::get('/empresas/{id}/areas', [EmpresaController::class, 'getAreas']);
        Route::apiResource('empresas', EmpresaController::class);
        
        // -------- EMPRESAS PARA SELECTOR (GESTIÓN DE CLIENTES) --------
        Route::get('/empresas/selector', [EmpresaController::class, 'paraSelector']);
        Route::get('/clientes/selector', [EmpresaController::class, 'paraSelector']); // Alias para compatibilidad
        
        // -------- GESTIÓN DE CLIENTES (USANDO EMPRESAS) --------
        Route::get('/clientes', [EmpresaController::class, 'listarClientes']); // Listar todos los clientes
        Route::post('/clientes', [EmpresaController::class, 'crearCliente']); // Crear nuevo cliente
        Route::get('/clientes/{id}', [EmpresaController::class, 'show']); // Mostrar cliente (usar show existente)
        Route::put('/clientes/{id}', [EmpresaController::class, 'actualizarCliente']); // Actualizar cliente
        Route::delete('/clientes/{id}', [EmpresaController::class, 'eliminarCliente']); // Eliminar cliente

        // -------- CONTACTOS --------
        Route::get('/contactos/buscar/{empresaId?}', [AreaContactoController::class, 'buscar']);
        Route::get('/contactos/estadisticas/{empresaId?}', [AreaContactoController::class, 'estadisticas']);
        Route::get('/contactos/por-empresa/{empresaId}', [AreaContactoController::class, 'porEmpresa']);
        Route::post('/contactos/importar', [AreaContactoController::class, 'importar']);
        Route::apiResource('contactos', AreaContactoController::class);

        // -------- ÁREAS --------
        Route::get('/empresa-areas/catalogo', [EmpresaAreaController::class, 'getCatalogo']);
        Route::get('/empresa-areas/buscar/{empresaId}', [EmpresaAreaController::class, 'buscar']);
        Route::get('/empresa-areas/estadisticas/{empresaId}', [EmpresaAreaController::class, 'estadisticas']);
        Route::post('/empresa-areas/importar', [EmpresaAreaController::class, 'importar']);
        Route::get('/empresas/{empresaId}/empresa-areas', [EmpresaAreaController::class, 'index']);
        Route::apiResource('empresa-areas', EmpresaAreaController::class);

        // -------- ACTIVIDADES --------
        Route::get('/actividades/filtrar-por-fecha', [ActividadController::class, 'filtrarPorFecha']);
        Route::get('/actividades/calendario', [ActividadController::class, 'paraCalendario']);
        Route::get('/actividades/por-empresa/{empresaId}', [ActividadController::class, 'porEmpresa']);
        Route::apiResource('actividades', ActividadController::class);

        // -------- CLIENTES API (COMPATIBILIDAD) --------
        // Mantener rutas del ClienteController para compatibilidad
        Route::get('/clientes-legacy', [ClienteController::class, 'index']);
        Route::get('/clientes-legacy/selector', [ClienteController::class, 'paraSelector']);
        Route::post('/clientes-legacy', [ClienteController::class, 'store']);
        Route::get('/clientes-legacy/{id}', [ClienteController::class, 'show']);
        Route::put('/clientes-legacy/{id}', [ClienteController::class, 'update']);
        Route::delete('/clientes-legacy/{id}', [ClienteController::class, 'destroy']);

        // -------- TEST ACTIVIDADES --------
        Route::get('/test-actividades', function () {

            $user = Auth::user();
            $empresa = \App\Models\Empresa::first();

            if (!$empresa) {
                return 'No hay empresas en la BD';
            }

            $actividad = new \App\Models\Actividad();
            $actividad->empresa_id = $empresa->id;
            $actividad->fecha = now()->toDateString();
            $actividad->hora = '14:30';
            $actividad->objetivo = 'Actividad de prueba';
            $actividad->datos_adicionales = 'Datos adicionales';
            $actividad->estado = 'Pendiente';
            $actividad->save();

            return '✅ Actividad creada. Usuario: ' . $user->id;
        });

    }); // FIN API

}); // FIN AUTH

// ============================
// FALLBACK 404
// ============================
Route::fallback(function () {
    return response()->view('errors.404', [], 404);
});