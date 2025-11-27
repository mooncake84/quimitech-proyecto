<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AreaContacto;
use App\Models\Empresa;

class AreaContactoController extends Controller
{
    public function index()
    {
        $contactos = AreaContacto::with('empresa')->get();
        return response()->json($contactos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'area' => 'required|string|max:255',
            'producto_requerido' => 'required|string|max:255',
            'encargado' => 'required|string|max:255',
            'puesto' => 'required|string|max:255',
            'correo' => 'required|email',
            'telefono' => 'required|string',
        ]);

        try {
            $areaContacto = AreaContacto::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Contacto guardado exitosamente',
                'contacto' => $areaContacto
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar contacto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $contacto = AreaContacto::with('empresa')->findOrFail($id);
        return response()->json($contacto);
    }

    public function update(Request $request, string $id)
    {
        $areaContacto = AreaContacto::findOrFail($id);
        
        $request->validate([
            'area' => 'sometimes|string|max:255',
            'producto_requerido' => 'sometimes|string|max:255',
            'encargado' => 'sometimes|string|max:255',
            'puesto' => 'sometimes|string|max:255',
            'correo' => 'sometimes|email',
            'telefono' => 'sometimes|string',
        ]);

        try {
            $areaContacto->update($request->all());
            
            return response()->json([
                'success' => true, 
                'message' => 'Contacto actualizado exitosamente',
                'contacto' => $areaContacto
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar contacto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $areaContacto = AreaContacto::findOrFail($id);
            $areaContacto->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Contacto eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar contacto: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para obtener contactos por empresa - ACTUALIZADO
    public function porEmpresa($empresaId)
    {
        try {
            $contactos = AreaContacto::where('empresa_id', $empresaId)
                ->orderBy('id', 'desc')
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => $contactos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar contactos: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}