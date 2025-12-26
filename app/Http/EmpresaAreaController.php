<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\EmpresaArea;
use App\Models\Empresa;

class EmpresaAreaController extends Controller
{
    /**
     * Obtener áreas de una empresa
     */
    public function index($empresaId)
    {
        try {
            $areas = EmpresaArea::where('empresa_id', $empresaId)
                ->orderBy('nombre')
                ->get();
            
            return response()->json([
                'success' => true,
                'areas' => $areas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener áreas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener áreas del catálogo
     */
    public function getCatalogo()
    {
        try {
            // Si tienes tabla de catálogo
            $catalogo = DB::table('areas_catalogo')
                ->orderBy('categoria')
                ->orderBy('nombre')
                ->get();
            
            return response()->json([
                'success' => true,
                'catalogo' => $catalogo
            ]);
        } catch (\Exception $e) {
            // Si no hay catálogo, devolver áreas comunes
            $areasComunes = [
                ['nombre' => 'Calderas', 'categoria' => 'Producción'],
                ['nombre' => 'Sacrificio Porcino', 'categoria' => 'Producción'],
                ['nombre' => 'Sacrificio Bovino', 'categoria' => 'Producción'],
                ['nombre' => 'Procesamiento', 'categoria' => 'Producción'],
                ['nombre' => 'Empaque', 'categoria' => 'Producción'],
                ['nombre' => 'Refrigeración', 'categoria' => 'Almacenamiento'],
                ['nombre' => 'Laboratorio', 'categoria' => 'Calidad'],
                ['nombre' => 'Mantenimiento', 'categoria' => 'Servicios'],
                ['nombre' => 'Administración', 'categoria' => 'Administrativo'],
                ['nombre' => 'Ventas', 'categoria' => 'Comercial'],
            ];
            
            return response()->json([
                'success' => true,
                'catalogo' => $areasComunes
            ]);
        }
    }

    /**
     * Crear nueva área
     */
    public function store(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string'
        ]);

        try {
            $area = EmpresaArea::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Área creada exitosamente',
                'area' => $area
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar área
     */
    public function update(Request $request, $id)
    {
        $area = EmpresaArea::findOrFail($id);
        
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string'
        ]);

        try {
            $area->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Área actualizada exitosamente',
                'area' => $area
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar área
     */
    public function destroy($id)
    {
        try {
            $area = EmpresaArea::findOrFail($id);
            $area->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Área eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar área: ' . $e->getMessage()
            ], 500);
        }
    }
}