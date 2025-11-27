<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Actividad;

class ActividadController extends Controller
{
    public function index()
    {
        $actividades = Actividad::with('empresa')->orderBy('fecha', 'desc')->get();
        return response()->json($actividades);
    }

    public function store(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'fecha' => 'required|date',
            'hora' => 'required',
            'objetivo' => 'required|string|max:500',
            'estado' => 'required|string',
            'datos_adicionales' => 'nullable|string',
            'pedido_entregado' => 'nullable|string',
            'cantidad_entregada' => 'nullable|string',
        ]);

        try {
            $actividad = Actividad::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Actividad guardada exitosamente',
                'actividad' => $actividad
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar actividad: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $actividad = Actividad::with('empresa')->findOrFail($id);
        return response()->json($actividad);
    }

    public function update(Request $request, string $id)
{
    $actividad = Actividad::findOrFail($id);
    
    $request->validate([
        'fecha' => 'sometimes|date',
        'hora' => 'sometimes',
        'objetivo' => 'sometimes|string|max:500',
        'estado' => 'sometimes|string|in:Pendiente,Completado,Retraso',
        'datos_adicionales' => 'nullable|string',
        'pedido_entregado' => 'nullable|string',
        'cantidad_entregada' => 'nullable|string',
    ]);

    try {
        $actividad->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Actividad actualizada exitosamente',
            'actividad' => $actividad
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al actualizar actividad: ' . $e->getMessage()
        ], 500);
    }
}

    public function destroy(string $id)
    {
        $actividad = Actividad::findOrFail($id);
        $actividad->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Actividad eliminada exitosamente'
        ]);
    }
}