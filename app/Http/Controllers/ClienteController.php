<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ClienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            Log::info('API: Obteniendo clientes', $request->all());
            
            $query = Cliente::query();
            
            // Filtrar por estado si se especifica
            if ($request->has('estado') && in_array($request->estado, ['activo', 'inactivo'])) {
                $query->where('estado', $request->estado);
            }
            
            // Buscar por término
            if ($request->has('buscar') && !empty($request->buscar)) {
                $query->buscar($request->buscar);
            }
            
            // Ordenar por nombre
            $query->orderBy('nombre', 'asc');
            
            $clientes = $query->get();
            
            return response()->json([
                'success' => true,
                'data' => $clientes,
                'count' => $clientes->count(),
                'message' => 'Clientes obtenidos exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener clientes', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error al obtener clientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('API: Creando nuevo cliente', $request->all());
            
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'rfc' => 'required|string|max:20|unique:clientes,rfc',
                'direccion' => 'nullable|string|max:500',
                'telefono' => 'required|string|max:20',
                'contacto' => 'required|string|max:100',
                'email' => 'required|email|max:100',
                'estado' => 'required|in:activo,inactivo',
                'notas' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $cliente = Cliente::create($request->all());
            
            Log::info('API: Cliente creado exitosamente', ['id' => $cliente->id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cliente creado exitosamente',
                'data' => $cliente
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('API: Error al crear cliente', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $cliente = Cliente::find($id);
            
            if (!$cliente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cliente no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $cliente,
                'message' => 'Cliente obtenido exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener cliente', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            Log::info('API: Actualizando cliente', ['id' => $id, 'data' => $request->all()]);
            
            $cliente = Cliente::find($id);
            
            if (!$cliente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cliente no encontrado'
                ], 404);
            }
            
            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:255',
                'rfc' => 'sometimes|required|string|max:20|unique:clientes,rfc,' . $id,
                'direccion' => 'nullable|string|max:500',
                'telefono' => 'sometimes|required|string|max:20',
                'contacto' => 'sometimes|required|string|max:100',
                'email' => 'sometimes|required|email|max:100',
                'estado' => 'sometimes|required|in:activo,inactivo',
                'notas' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $cliente->update($request->all());
            
            Log::info('API: Cliente actualizado exitosamente', ['id' => $id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cliente actualizado exitosamente',
                'data' => $cliente
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al actualizar cliente', [
                'id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $cliente = Cliente::find($id);
            
            if (!$cliente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cliente no encontrado'
                ], 404);
            }
            
            // Verificar si tiene actividades asociadas
            $actividadesCount = $cliente->actividades()->count();
            
            if ($actividadesCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el cliente porque tiene actividades asociadas'
                ], 400);
            }
            
            $cliente->delete();
            
            Log::info('API: Cliente eliminado exitosamente', ['id' => $id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cliente eliminado exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al eliminar cliente', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener clientes para selector (solo activos, formato simplificado)
     */
    public function paraSelector(Request $request)
    {
        try {
            $clientes = Cliente::activos()
                ->orderBy('nombre', 'asc')
                ->select('id', 'nombre', 'rfc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $clientes,
                'message' => 'Clientes para selector obtenidos exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error obteniendo clientes para selector', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error obteniendo clientes para selector'
            ], 500);
        }
    }
}