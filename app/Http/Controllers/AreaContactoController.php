<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\AreaContacto;
use App\Models\Empresa;

class AreaContactoController extends Controller
{
    /**
     * Store a newly created resource in storage.
     * RUTA: POST /api/contactos
     * 
     * ¡¡¡ESTE MÉTODO FALTA Y ES CRÍTICO!!!
     */
    public function store(Request $request)
    {
        try {
            Log::info('API: Creando nuevo contacto', $request->all());
            
            $validated = $request->validate([
                'empresa_id' => 'required|exists:empresas,id',
                'area' => 'required|string|max:255',
                'producto' => 'nullable|string|max:255',
                'encargado' => 'required|string|max:255',
                'puesto' => 'nullable|string|max:255',
                'telefono' => 'nullable|string|max:20',
                'correo' => 'nullable|email|max:100',
            ]);
            
            Log::debug('Datos validados para crear contacto:', $validated);
            
            $contacto = AreaContacto::create($validated);
            
            Log::info('API: Contacto creado exitosamente', [
                'id' => $contacto->id,
                'empresa_id' => $contacto->empresa_id,
                'area' => $contacto->area,
                'encargado' => $contacto->encargado
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Contacto creado exitosamente',
                'data' => $contacto
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('API: Error al crear contacto', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear contacto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     * RUTA: GET /api/contactos
     */
    public function index(Request $request)
    {
        try {
            Log::info('API: Obteniendo todos los contactos', $request->all());
            
            $query = AreaContacto::with('empresa');
            
            // Filtrar por empresa si se especifica
            if ($request->has('empresa_id')) {
                $empresaId = $request->query('empresa_id');
                $query->where('empresa_id', $empresaId);
            }
            
            // Filtrar por área si se especifica
            if ($request->has('area')) {
                $area = $request->query('area');
                $query->where('area', $area);
            }
            
            // Ordenar
            $query->orderBy('empresa_id')
                  ->orderBy('area')
                  ->orderBy('encargado');
            
            $contactos = $query->get();
            
            Log::info('API: Contactos obtenidos', ['count' => $contactos->count()]);
            
            return response()->json([
                'success' => true,
                'data' => $contactos,
                'count' => $contactos->count(),
                'message' => 'Contactos obtenidos exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener contactos', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener contactos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener contactos por empresa
     * RUTA: GET /api/contactos/por-empresa/{empresaId}
     */
    public function porEmpresa($empresaId)
    {
        try {
            Log::info('API: Obteniendo contactos por empresa', ['empresa_id' => $empresaId]);
            
            // Verificar que la empresa existe
            $empresa = Empresa::find($empresaId);
            
            if (!$empresa) {
                Log::warning('API: Empresa no encontrada', ['empresa_id' => $empresaId]);
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            $contactos = AreaContacto::where('empresa_id', $empresaId)
                ->orderBy('area')
                ->orderBy('encargado')
                ->get()
                ->map(function($contacto) {
                    return [
                        'id' => $contacto->id,
                        'empresa_id' => $contacto->empresa_id,
                        'area' => $contacto->area,
                        'producto' => $contacto->producto,
                        'nombre_contacto' => $contacto->encargado, // Alias para compatibilidad
                        'encargado' => $contacto->encargado, // Columna real
                        'telefono' => $contacto->telefono,
                        'correo' => $contacto->correo,
                        'email' => $contacto->correo, // Alias para compatibilidad
                        'puesto' => $contacto->puesto,
                        'created_at' => $contacto->created_at,
                        'updated_at' => $contacto->updated_at
                    ];
                });
            
            Log::info('API: Contactos por empresa obtenidos', [
                'empresa_id' => $empresaId,
                'count' => $contactos->count()
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $contactos,
                'count' => $contactos->count(),
                'empresa' => [
                    'id' => $empresa->id,
                    'nombre' => $empresa->nombre
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener contactos por empresa', [
                'empresa_id' => $empresaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener contactos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * RUTA: GET /api/contactos/{id}
     */
    public function show($id)
    {
        try {
            Log::info('API: Obteniendo contacto', ['id' => $id]);
            
            $contacto = AreaContacto::with('empresa')->find($id);
            
            if (!$contacto) {
                Log::warning('API: Contacto no encontrado', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Contacto no encontrado'
                ], 404);
            }
            
            // Formatear respuesta para compatibilidad
            $data = [
                'id' => $contacto->id,
                'empresa_id' => $contacto->empresa_id,
                'producto' => $contacto->producto,
                'nombre_contacto' => $contacto->encargado,
                'encargado' => $contacto->encargado,
                'telefono' => $contacto->telefono,
                'correo' => $contacto->correo,
                'email' => $contacto->correo,
                'puesto' => $contacto->puesto,
                'created_at' => $contacto->created_at,
                'updated_at' => $contacto->updated_at,
                'empresa' => $contacto->empresa ? [
                    'id' => $contacto->empresa->id,
                    'nombre' => $contacto->empresa->nombre
                ] : null
            ];
            
            Log::info('API: Contacto obtenido exitosamente', ['id' => $contacto->id]);
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Contacto obtenido exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener contacto', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener contacto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * RUTA: PUT /api/contactos/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('API: Actualizando contacto', ['id' => $id, 'data' => $request->all()]);
            
            $contacto = AreaContacto::find($id);
            
            if (!$contacto) {
                Log::warning('API: Contacto no encontrado para actualizar', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Contacto no encontrado'
                ], 404);
            }
            
            $validated = $request->validate([
                'area' => 'sometimes|string|max:255',
                'producto' => 'nullable|string|max:255',
                'encargado' => 'sometimes|string|max:255',
                'puesto' => 'nullable|string|max:255',
                'telefono' => 'nullable|string|max:20',
                'correo' => 'nullable|email|max:100',
            ]);
            
            // Actualizar solo los campos proporcionados
            $camposActualizar = [];
            foreach ($validated as $key => $value) {
                if ($request->has($key)) {
                    $camposActualizar[$key] = $value;
                }
            }
            
            if (!empty($camposActualizar)) {
                $contacto->update($camposActualizar);
            }
            
            Log::info('API: Contacto actualizado exitosamente', ['id' => $contacto->id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Contacto actualizado exitosamente',
                'data' => $contacto
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al actualizar contacto', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar contacto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * RUTA: DELETE /api/contactos/{id}
     */
    public function destroy($id)
    {
        try {
            Log::info('API: Eliminando contacto', ['id' => $id]);
            
            $contacto = AreaContacto::find($id);
            
            if (!$contacto) {
                Log::warning('API: Contacto no encontrado para eliminar', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Contacto no encontrado'
                ], 404);
            }
            
            $datosContacto = [
                'id' => $contacto->id,
                'area' => $contacto->area,
                'encargado' => $contacto->encargado,
                'empresa_id' => $contacto->empresa_id
            ];
            
            $contacto->delete();
            
            Log::info('API: Contacto eliminado exitosamente', $datosContacto);
            
            return response()->json([
                'success' => true,
                'message' => 'Contacto eliminado exitosamente',
                'deleted_data' => $datosContacto
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al eliminar contacto', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar contacto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar contactos
     * RUTA: GET /api/contactos/buscar/{empresaId?}
     */
    public function buscar(Request $request, $empresaId = null)
    {
        try {
            $termino = $request->query('q', '');
            
            Log::info('API: Buscando contactos', [
                'empresa_id' => $empresaId,
                'termino' => $termino
            ]);
            
            $query = AreaContacto::with('empresa');
            
            if ($empresaId) {
                $query->where('empresa_id', $empresaId);
            }
            
            if (!empty($termino)) {
                $query->where(function($q) use ($termino) {
                    $q->where('area', 'LIKE', "%{$termino}%")
                      ->orWhere('producto', 'LIKE', "%{$termino}%")
                      ->orWhere('encargado', 'LIKE', "%{$termino}%")
                      ->orWhere('telefono', 'LIKE', "%{$termino}%")
                      ->orWhere('correo', 'LIKE', "%{$termino}%")
                      ->orWhere('puesto', 'LIKE', "%{$termino}%");

                });
            }
            
            $contactos = $query->orderBy('area')
                ->orderBy('encargado')
                ->take(50)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $contactos,
                'count' => $contactos->count(),
                'empresa_id' => $empresaId,
                'termino' => $termino
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error en búsqueda de contactos', [
                'empresa_id' => $empresaId,
                'termino' => $request->query('q'),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error en búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de contactos
     * RUTA: GET /api/contactos/estadisticas/{empresaId?}
     */
    public function estadisticas($empresaId = null)
    {
        try {
            Log::info('API: Obteniendo estadísticas de contactos', ['empresa_id' => $empresaId]);
            
            $query = AreaContacto::query();
            
            if ($empresaId) {
                $query->where('empresa_id', $empresaId);
            }
            
            $total = $query->count();
            $conCorreo = $query->whereNotNull('correo')->where('correo', '!=', '')->count();
            $conPuesto = $query->whereNotNull('puesto')->where('puesto', '!=', '')->count();
            
            // Contactos por área
            $porArea = AreaContacto::select('area', DB::raw('COUNT(*) as total'))
                ->when($empresaId, function($q) use ($empresaId) {
                    return $q->where('empresa_id', $empresaId);
                })
                ->groupBy('area')
                ->orderBy('total', 'desc')
                ->get();
            
            $estadisticas = [
                'total_contactos' => $total,
                'contactos_con_correo' => $conCorreo,
                'contactos_con_puesto' => $conPuesto,
                'porcentaje_correo' => $total > 0 ? round(($conCorreo / $total) * 100, 2) : 0,
                'porcentaje_puesto' => $total > 0 ? round(($conPuesto / $total) * 100, 2) : 0,
                'contactos_por_area' => $porArea,
                'empresa_id' => $empresaId,
                'ultima_actualizacion' => now()->format('Y-m-d H:i:s')
            ];
            
            Log::info('API: Estadísticas de contactos obtenidas', $estadisticas);
            
            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener estadísticas de contactos', [
                'empresa_id' => $empresaId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Importar contactos (para inicialización)
     * RUTA: POST /api/contactos/importar
     */
    public function importar(Request $request)
    {
        try {
            Log::info('API: Importando contactos', $request->all());
            
            $validated = $request->validate([
                'empresa_id' => 'required|exists:empresas,id',
                'contactos' => 'required|array',
                'contactos.*.area' => 'required|string|max:255',
                'contactos.*.producto' => 'nullable|string|max:255',
                'contactos.*.encargado' => 'required|string|max:255',
                'contactos.*.telefono' => 'nullable|string|max:20',
                'contactos.*.correo' => 'nullable|email|max:100',
                'contactos.*.puesto' => 'nullable|string|max:255',
            ]);
            
            DB::beginTransaction();
            
            $empresaId = $validated['empresa_id'];
            $contactosImportados = [];
            $contactosDuplicados = [];
            
            foreach ($validated['contactos'] as $contactoData) {
                // Verificar si ya existe (misma área, mismo encargado en la misma empresa)
                $existe = AreaContacto::where('empresa_id', $empresaId)
                    ->where('area', $contactoData['area'])
                    ->where('encargado', $contactoData['encargado'])
                    ->exists();
                
                if (!$existe) {
                    $contacto = AreaContacto::create(array_merge(
                        ['empresa_id' => $empresaId],
                        $contactoData
                    ));
                    
                    $contactosImportados[] = $contacto;
                } else {
                    $contactosDuplicados[] = $contactoData['area'] . ' - ' . $contactoData['encargado'];
                }
            }
            
            DB::commit();
            
            Log::info('API: Importación completada', [
                'empresa_id' => $empresaId,
                'importados' => count($contactosImportados),
                'duplicados' => count($contactosDuplicados)
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Importación completada',
                'importados' => count($contactosImportados),
                'duplicados' => count($contactosDuplicados),
                'contactos_duplicados' => $contactosDuplicados,
                'data' => $contactosImportados
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('API: Error en importación de contactos', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error en importación: ' . $e->getMessage()
            ], 500);
        }
    }
}