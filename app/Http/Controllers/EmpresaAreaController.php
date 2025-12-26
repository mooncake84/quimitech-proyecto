<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmpresaArea;
use App\Models\Empresa;
use Illuminate\Support\Facades\DB;

class EmpresaAreaController extends Controller
{
    /**
     * Obtener todas las áreas de una empresa
     */
    public function index($empresaId)
    {
        try {
            // Verificar que la empresa existe
            $empresa = Empresa::findOrFail($empresaId);
            
            $areas = EmpresaArea::where('empresa_id', $empresaId)
                ->orderBy('nombre')
                ->get();
            
            return response()->json([
                'success' => true,
                'empresa' => [
                    'id' => $empresa->id,
                    'nombre' => $empresa->nombre
                ],
                'data' => $areas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener áreas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un área específica
     */
    public function show($id)
    {
        try {
            $area = EmpresaArea::with('empresa')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $area
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Área no encontrada'
            ], 404);
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
            // Verificar que no exista un área con el mismo nombre en la misma empresa
            $areaExistente = EmpresaArea::where('empresa_id', $request->empresa_id)
                ->where('nombre', $request->nombre)
                ->first();
            
            if ($areaExistente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe un área con ese nombre en esta empresa'
                ], 400);
            }
            
            $area = EmpresaArea::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Área creada exitosamente',
                'data' => $area
            ], 201);
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
        try {
            $area = EmpresaArea::findOrFail($id);
            
            $request->validate([
                'nombre' => 'sometimes|string|max:100',
                'descripcion' => 'nullable|string'
            ]);
            
            // Verificar que el nuevo nombre no exista en la misma empresa
            if ($request->has('nombre') && $request->nombre !== $area->nombre) {
                $nombreExistente = EmpresaArea::where('empresa_id', $area->empresa_id)
                    ->where('nombre', $request->nombre)
                    ->where('id', '!=', $id)
                    ->first();
                
                if ($nombreExistente) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ya existe otra área con ese nombre en esta empresa'
                    ], 400);
                }
            }
            
            $area->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Área actualizada exitosamente',
                'data' => $area
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
            $nombreArea = $area->nombre;
            $area->delete();
            
            return response()->json([
                'success' => true,
                'message' => "Área '{$nombreArea}' eliminada exitosamente"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar área: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Importar múltiples áreas (para inicialización)
     */
    public function importar(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'areas' => 'required|array',
            'areas.*.nombre' => 'required|string|max:100',
            'areas.*.descripcion' => 'nullable|string'
        ]);
        
        DB::beginTransaction();
        
        try {
            $empresaId = $request->empresa_id;
            $areasImportadas = [];
            $areasDuplicadas = [];
            
            foreach ($request->areas as $areaData) {
                // Verificar si ya existe
                $existe = EmpresaArea::where('empresa_id', $empresaId)
                    ->where('nombre', $areaData['nombre'])
                    ->exists();
                
                if (!$existe) {
                    $area = EmpresaArea::create([
                        'empresa_id' => $empresaId,
                        'nombre' => $areaData['nombre'],
                        'descripcion' => $areaData['descripcion'] ?? null
                    ]);
                    
                    $areasImportadas[] = $area;
                } else {
                    $areasDuplicadas[] = $areaData['nombre'];
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Importación completada',
                'importadas' => count($areasImportadas),
                'duplicadas' => count($areasDuplicadas),
                'areas_duplicadas' => $areasDuplicadas,
                'data' => $areasImportadas
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error en importación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar áreas
     */
    public function buscar(Request $request, $empresaId)
    {
        try {
            $termino = $request->query('q', '');
            
            $areas = EmpresaArea::where('empresa_id', $empresaId)
                ->where(function($query) use ($termino) {
                    $query->where('nombre', 'LIKE', "%{$termino}%")
                          ->orWhere('descripcion', 'LIKE', "%{$termino}%");
                })
                ->orderBy('nombre')
                ->take(20)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $areas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas de áreas
     */
    public function estadisticas($empresaId)
    {
        try {
            $total = EmpresaArea::where('empresa_id', $empresaId)->count();
            $conDescripcion = EmpresaArea::where('empresa_id', $empresaId)
                ->whereNotNull('descripcion')
                ->where('descripcion', '!=', '')
                ->count();
            
            // Área más antigua y más reciente
            $masAntigua = EmpresaArea::where('empresa_id', $empresaId)
                ->orderBy('created_at')
                ->first();
            
            $masReciente = EmpresaArea::where('empresa_id', $empresaId)
                ->orderBy('created_at', 'desc')
                ->first();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_areas' => $total,
                    'areas_con_descripcion' => $conDescripcion,
                    'porcentaje_descripcion' => $total > 0 ? round(($conDescripcion / $total) * 100, 2) : 0,
                    'mas_antigua' => $masAntigua ? [
                        'nombre' => $masAntigua->nombre,
                        'fecha' => $masAntigua->created_at->format('Y-m-d')
                    ] : null,
                    'mas_reciente' => $masReciente ? [
                        'nombre' => $masReciente->nombre,
                        'fecha' => $masReciente->created_at->format('Y-m-d')
                    ] : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
}