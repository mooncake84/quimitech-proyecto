<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Empresa;
use App\Models\AreaContacto;
use App\Models\EmpresaArea;

class EmpresaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            Log::info('API: Obteniendo lista de empresas');
            
            $empresas = Empresa::with(['areasContacto', 'areas'])
                ->orderBy('nombre')
                ->get();
            
            Log::info('API: Empresas obtenidas correctamente', ['count' => $empresas->count()]);
            
            return response()->json([
                'success' => true,
                'data' => $empresas,
                'count' => $empresas->count(),
                'message' => 'Empresas obtenidas exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener empresas', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener empresas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('API: Creando nueva empresa', $request->all());
        
        // VALIDACIÓN CON 8 CAMPOS (INCLUYENDO ESTADO)
        $validated = $request->validate([
            'nombre' => 'required|string|max:200',
            'giro' => 'required|string|max:200',
            'direccion' => 'required|string|max:500',
            'contacto' => 'required|string|max:200',
            'telefono' => 'required|string|max:50',
            'email' => 'nullable|email|max:100',
            'industria' => 'nullable|string|max:100',
            'estado' => 'nullable|string|in:activo,inactivo', // ✅ AGREGADO
            'areas' => 'nullable|array',
            'areas.*.nombre' => 'required_with:areas|string|max:100',
            'areas.*.descripcion' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // CREAR EMPRESA CON 8 CAMPOS (INCLUYENDO ESTADO)
            $empresa = Empresa::create([
                'nombre' => $validated['nombre'],
                'giro' => $validated['giro'],
                'direccion' => $validated['direccion'],
                'contacto' => $validated['contacto'],
                'telefono' => $validated['telefono'],
                'email' => $validated['email'] ?? null,
                'industria' => $validated['industria'] ?? null,
                'estado' => $validated['estado'] ?? 'activo', // ✅ AGREGADO
            ]);

            Log::info('API: Empresa creada', [
                'id' => $empresa->id,
                'estado' => $empresa->estado // ✅ LOG DEL ESTADO
            ]);

            // Crear áreas asociadas (si se proporcionaron)
            if (isset($validated['areas']) && is_array($validated['areas'])) {
                $areasCreadas = [];
                
                foreach ($validated['areas'] as $areaData) {
                    if (!empty($areaData['nombre'])) {
                        $area = EmpresaArea::create([
                            'empresa_id' => $empresa->id,
                            'nombre' => $areaData['nombre'],
                            'descripcion' => $areaData['descripcion'] ?? null,
                        ]);
                        
                        $areasCreadas[] = $area;
                    }
                }
                
                Log::info('API: Áreas creadas para empresa', [
                    'empresa_id' => $empresa->id,
                    'areas_count' => count($areasCreadas)
                ]);
            }

            DB::commit();

            // Cargar relaciones para respuesta
            $empresa->load(['areasContacto', 'areas']);

            Log::info('API: Empresa creada exitosamente', [
                'id' => $empresa->id,
                'estado' => $empresa->estado // ✅ LOG DEL ESTADO
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Empresa registrada exitosamente',
                'data' => $empresa
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('API: Error al crear empresa', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $validated
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            Log::info('API: Obteniendo empresa', ['id' => $id]);
            
            // Validar que el ID sea numérico
            if (!is_numeric($id)) {
                Log::warning('API: ID de empresa no numérico', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'ID de empresa inválido',
                    'error_code' => 'INVALID_ID'
                ], 400);
            }
            
            $empresa = Empresa::with(['areasContacto', 'areas'])->find($id);
            
            if (!$empresa) {
                Log::warning('API: Empresa no encontrada', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada',
                    'error_code' => 'EMPRESA_NOT_FOUND',
                    'requested_id' => $id
                ], 404);
            }
            
            // Asegurar que los campos tengan valores por defecto
            $empresa->email = $empresa->email ?? '';
            $empresa->industria = $empresa->industria ?? '';
            $empresa->estado = $empresa->estado ?? 'activo'; // ✅ VALOR POR DEFECTO
            
            Log::info('API: Empresa obtenida exitosamente', [
                'id' => $empresa->id,
                'nombre' => $empresa->nombre,
                'estado' => $empresa->estado // ✅ LOG DEL ESTADO
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $empresa,
                'message' => 'Empresa obtenida exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener empresa', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            Log::info('API: Actualizando empresa', ['id' => $id, 'data' => $request->all()]);
            
            $empresa = Empresa::find($id);
            
            if (!$empresa) {
                Log::warning('API: Empresa no encontrada para actualizar', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            // VALIDACIÓN CON 8 CAMPOS (INCLUYENDO ESTADO)
            $validatedData = $request->validate([
                'nombre' => 'sometimes|string|max:200',
                'giro' => 'sometimes|string|max:200',
                'direccion' => 'sometimes|string|max:500',
                'contacto' => 'sometimes|string|max:200',
                'telefono' => 'sometimes|string|max:50',
                'email' => 'sometimes|nullable|email|max:100',
                'industria' => 'sometimes|nullable|string|max:100',
                'estado' => 'sometimes|nullable|string|in:activo,inactivo', // ✅ AGREGADO
            ]);

            // FILTRAR: Solo actualizar los campos que realmente vienen en la solicitud
            $datosActualizar = [];
            foreach ($validatedData as $key => $value) {
                if ($request->has($key)) {
                    $datosActualizar[$key] = $value;
                }
            }

            // Actualizar solo los campos proporcionados (edición parcial)
            if (!empty($datosActualizar)) {
                $empresa->update($datosActualizar);
                Log::info('API: Campos actualizados', [
                    'id' => $empresa->id,
                    'campos' => array_keys($datosActualizar),
                    'estado' => $datosActualizar['estado'] ?? 'no cambiado' // ✅ LOG DEL ESTADO
                ]);
            } else {
                Log::info('API: No hay campos para actualizar', ['id' => $empresa->id]);
            }
            
            // Recargar datos actualizados
            $empresa->refresh();
            $empresa->load(['areasContacto', 'areas']);
            
            Log::info('API: Empresa actualizada exitosamente', [
                'id' => $empresa->id,
                'estado' => $empresa->estado // ✅ LOG DEL ESTADO ACTUAL
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Empresa actualizada exitosamente',
                'data' => $empresa
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al actualizar empresa', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();
        
        try {
            Log::info('API: Eliminando empresa', ['id' => $id]);
            
            $empresa = Empresa::find($id);
            
            if (!$empresa) {
                Log::warning('API: Empresa no encontrada para eliminar', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            $nombreEmpresa = $empresa->nombre;
            
            // Eliminar áreas asociadas primero
            $empresa->areas()->delete();
            Log::info('API: Áreas eliminadas', ['empresa_id' => $id]);
            
            // Eliminar contactos asociados
            AreaContacto::where('empresa_id', $id)->delete();
            Log::info('API: Contactos eliminados', ['empresa_id' => $id]);
            
            // Eliminar la empresa
            $empresa->delete();
            
            DB::commit();
            
            Log::info('API: Empresa eliminada exitosamente', [
                'id' => $id,
                'nombre' => $nombreEmpresa
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Empresa '{$nombreEmpresa}' eliminada exitosamente"
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('API: Error al eliminar empresa', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================================================================
    // MÉTODOS PARA GESTIÓN DE CLIENTES (EMPRESAS)
    // =========================================================================

    /**
     * Obtener empresas para selector (activas)
     */
    public function paraSelector(Request $request)
    {
        try {
            Log::info('API: Obteniendo empresas para selector');
            
            $empresas = Empresa::orderBy('nombre', 'asc')
                ->select('id', 'nombre', 'contacto', 'telefono', 'email', 'estado') // ✅ AGREGADO ESTADO
                ->get();
            
            Log::info('API: Empresas obtenidas para selector', ['count' => $empresas->count()]);
            
            return response()->json([
                'success' => true,
                'data' => $empresas,
                'count' => $empresas->count(),
                'message' => 'Empresas obtenidas para selector'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error obteniendo empresas para selector', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error obteniendo empresas para selector: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las empresas para gestión de clientes
     */
    public function listarClientes(Request $request)
    {
        try {
            Log::info('API: Obteniendo todas las empresas para gestión de clientes', $request->all());
            
            $query = Empresa::query();
            
            // Filtrar por búsqueda si se especifica
            if ($request->has('buscar') && !empty($request->buscar)) {
                $buscar = $request->buscar;
                $query->where(function ($q) use ($buscar) {
                    $q->where('nombre', 'LIKE', "%{$buscar}%")
                      ->orWhere('contacto', 'LIKE', "%{$buscar}%")
                      ->orWhere('telefono', 'LIKE', "%{$buscar}%")
                      ->orWhere('email', 'LIKE', "%{$buscar}%")
                      ->orWhere('giro', 'LIKE', "%{$buscar}%")
                      ->orWhere('industria', 'LIKE', "%{$buscar}%")
                      ->orWhere('estado', 'LIKE', "%{$buscar}%"); // ✅ AGREGADO BÚSQUEDA POR ESTADO
                });
            }
            
            // Filtrar por estado si se especifica
            if ($request->has('estado') && $request->estado !== 'todos') {
                $query->where('estado', $request->estado);
            }
            
            // Ordenar por nombre
            $query->orderBy('nombre', 'asc');
            
            $empresas = $query->get();
            
            Log::info('API: Empresas obtenidas para gestión de clientes', [
                'count' => $empresas->count(),
                'estado_filtro' => $request->estado ?? 'todos' // ✅ LOG DEL FILTRO
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $empresas,
                'count' => $empresas->count(),
                'message' => 'Clientes obtenidos exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener empresas para gestión de clientes', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error al obtener clientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva empresa (cliente) - Versión simplificada
     */
    public function crearCliente(Request $request)
    {
        try {
            Log::info('API: Creando nueva empresa/cliente', $request->all());
            
            // ✅ CORRECCIÓN: VALIDACIÓN CON CAMPOS REALES DE LA BD (INCLUYENDO ESTADO)
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:200',
                'giro' => 'nullable|string|max:200',
                'direccion' => 'nullable|string|max:500',
                'contacto' => 'nullable|string|max:200',
                'telefono' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:100',
                'industria' => 'nullable|string|max:100',
                'estado' => 'nullable|string|in:activo,inactivo' // ✅ AGREGADO
            ]);
            
            if ($validator->fails()) {
                Log::warning('API: Validación fallida al crear cliente', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Si no se envía giro, usar industria o viceversa
            $datos = $request->all();
            if (empty($datos['giro']) && !empty($datos['industria'])) {
                $datos['giro'] = $datos['industria'];
            } elseif (empty($datos['industria']) && !empty($datos['giro'])) {
                $datos['industria'] = $datos['giro'];
            }
            
            // ✅ ESTABLECER VALOR POR DEFECTO PARA ESTADO SI NO SE ESPECIFICA
            if (!isset($datos['estado'])) {
                $datos['estado'] = 'activo';
            }
            
            $empresa = Empresa::create($datos);
            
            Log::info('API: Empresa/cliente creada exitosamente', [
                'id' => $empresa->id, 
                'nombre' => $empresa->nombre,
                'estado' => $empresa->estado // ✅ LOG DEL ESTADO
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cliente creado exitosamente',
                'data' => $empresa
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('API: Error al crear empresa/cliente', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar empresa (cliente) - Versión simplificada
     */
    public function actualizarCliente(Request $request, $id)
    {
        try {
            Log::info('API: Actualizando empresa/cliente', ['id' => $id, 'data' => $request->all()]);
            
            $empresa = Empresa::find($id);
            
            if (!$empresa) {
                Log::warning('API: Empresa no encontrada para actualizar', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Cliente no encontrado'
                ], 404);
            }
            
            // ✅ CORRECCIÓN: VALIDACIÓN CON CAMPOS REALES DE LA BD (INCLUYENDO ESTADO)
            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|string|max:200',
                'giro' => 'nullable|string|max:200',
                'direccion' => 'nullable|string|max:500',
                'contacto' => 'nullable|string|max:200',
                'telefono' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:100',
                'industria' => 'nullable|string|max:100',
                'estado' => 'nullable|string|in:activo,inactivo' // ✅ AGREGADO
            ]);
            
            if ($validator->fails()) {
                Log::warning('API: Validación fallida al actualizar cliente', [
                    'id' => $id,
                    'errors' => $validator->errors()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Si no se envía giro, usar industria o viceversa
            $datos = $request->all();
            if (empty($datos['giro']) && !empty($datos['industria'])) {
                $datos['giro'] = $datos['industria'];
            } elseif (empty($datos['industria']) && !empty($datos['giro'])) {
                $datos['industria'] = $datos['giro'];
            }
            
            // ✅ CORRECCIÓN: FILTRAR DATOS INCLUYENDO ESTADO
            $datosActualizar = [];
            $camposPermitidos = [
                'nombre', 'giro', 'direccion', 'contacto', 
                'telefono', 'email', 'industria', 'estado'
            ];
            
            foreach ($camposPermitidos as $campo) {
                if ($request->has($campo)) {
                    $datosActualizar[$campo] = $datos[$campo] ?? null;
                }
            }
            
            if (!empty($datosActualizar)) {
                $empresa->update($datosActualizar);
                Log::info('API: Campos actualizados del cliente', [
                    'id' => $empresa->id,
                    'campos' => array_keys($datosActualizar),
                    'estado' => $datosActualizar['estado'] ?? 'no cambiado' // ✅ LOG DEL ESTADO
                ]);
            }
            
            Log::info('API: Cliente actualizado exitosamente', [
                'id' => $id, 
                'nombre' => $empresa->nombre,
                'estado_actual' => $empresa->estado // ✅ LOG DEL ESTADO ACTUAL
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cliente actualizado exitosamente',
                'data' => $empresa
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al actualizar empresa/cliente', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar empresa (cliente) - Versión simplificada
     */
    public function eliminarCliente($id)
    {
        try {
            Log::info('API: Eliminando empresa/cliente', ['id' => $id]);
            
            $empresa = Empresa::find($id);
            
            if (!$empresa) {
                Log::warning('API: Empresa no encontrada para eliminar', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Cliente no encontrado'
                ], 404);
            }
            
            $nombreEmpresa = $empresa->nombre;
            
            // Verificar si tiene actividades asociadas
            $actividadesCount = 0;
            if (class_exists('App\Models\Actividad')) {
                $actividadesCount = \App\Models\Actividad::where('empresa_id', $id)->count();
            }
            
            if ($actividadesCount > 0) {
                Log::warning('API: No se puede eliminar cliente con actividades', [
                    'id' => $id,
                    'actividades_count' => $actividadesCount
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el cliente porque tiene actividades asociadas'
                ], 400);
            }
            
            // Eliminar la empresa
            $empresa->delete();
            
            Log::info('API: Cliente eliminado exitosamente', [
                'id' => $id,
                'nombre' => $nombreEmpresa
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cliente eliminado exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al eliminar empresa/cliente', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    // =========================================================================
    // MÉTODOS EXISTENTES (MANTENER COMPATIBILIDAD)
    // =========================================================================

    /**
     * Método específico para obtener información general con formato específico
     */
    public function getInfoGeneral(string $id = null)
    {
        try {
            Log::info('API: Obteniendo información general', ['id' => $id]);
            
            $query = Empresa::with(['areasContacto', 'areas']);
            
            if ($id) {
                if (!is_numeric($id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'ID de empresa inválido'
                    ], 400);
                }
                $query->where('id', $id);
            }
            
            $empresas = $query->get()->map(function($empresa) {
                return [
                    'id' => $empresa->id,
                    'nombre' => $empresa->nombre,
                    'giro' => $empresa->giro,
                    'direccion' => $empresa->direccion,
                    'contacto' => $empresa->contacto,
                    'telefono' => $empresa->telefono,
                    'email' => $empresa->email ?? 'No disponible',
                    'industria' => $empresa->industria ?? 'No disponible',
                    'estado' => $empresa->estado ?? 'activo', // ✅ AGREGADO ESTADO
                    'areas' => $empresa->areas->map(function($area) {
                        return [
                            'id' => $area->id,
                            'nombre' => $area->nombre,
                            'descripcion' => $area->descripcion ?? 'Sin descripción'
                        ];
                    }),
                    'contactos_count' => $empresa->areasContacto->count(),
                    'areas_count' => $empresa->areas->count(),
                    'created_at' => $empresa->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $empresa->updated_at->format('Y-m-d H:i:s'),
                ];
            });
            
            if ($id) {
                $empresa = $empresas->first();
                if (!$empresa) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Empresa no encontrada'
                    ], 404);
                }
                
                return response()->json([
                    'success' => true,
                    'data' => $empresa
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => $empresas,
                'count' => $empresas->count()
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener información general', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las áreas de una empresa específica
     */
    public function getAreas(string $id)
    {
        try {
            Log::info('API: Obteniendo áreas de empresa', ['id' => $id]);
            
            $empresa = Empresa::with('areas')->find($id);
            
            if (!$empresa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Empresa no encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $empresa->areas,
                'count' => $empresa->areas->count(),
                'empresa' => [
                    'id' => $empresa->id,
                    'nombre' => $empresa->nombre,
                    'estado' => $empresa->estado // ✅ AGREGADO ESTADO
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener áreas', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener áreas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar empresas por término
     */
    public function buscar(Request $request)
    {
        try {
            $termino = $request->query('q', '');
            $limit = $request->query('limit', 10);
            
            Log::info('API: Buscando empresas', ['termino' => $termino, 'limit' => $limit]);
            
            if (empty($termino)) {
                $empresas = Empresa::with('areas')
                    ->orderBy('nombre')
                    ->take($limit)
                    ->get();
            } else {
                $empresas = Empresa::where('nombre', 'LIKE', "%{$termino}%")
                    ->orWhere('giro', 'LIKE', "%{$termino}%")
                    ->orWhere('contacto', 'LIKE', "%{$termino}%")
                    ->orWhere('telefono', 'LIKE', "%{$termino}%")
                    ->orWhere('email', 'LIKE', "%{$termino}%")
                    ->orWhere('industria', 'LIKE', "%{$termino}%")
                    ->orWhere('estado', 'LIKE', "%{$termino}%") // ✅ AGREGADO BÚSQUEDA POR ESTADO
                    ->with('areas')
                    ->orderBy('nombre')
                    ->take($limit)
                    ->get();
            }
            
            return response()->json([
                'success' => true,
                'data' => $empresas,
                'count' => $empresas->count(),
                'termino' => $termino
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error en búsqueda de empresas', [
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
     * Obtener estadísticas de empresas
     */
    public function estadisticas()
    {
        try {
            Log::info('API: Obteniendo estadísticas de empresas');
            
            $total = Empresa::count();
            $conEmail = Empresa::whereNotNull('email')->where('email', '!=', '')->count();
            $conAreas = DB::table('empresa_areas')
                ->distinct('empresa_id')
                ->count('empresa_id');
            
            // ✅ AGREGAR ESTADÍSTICAS POR ESTADO
            $activos = Empresa::where('estado', 'activo')->count();
            $inactivos = Empresa::where('estado', 'inactivo')->count();
            
            $estadisticas = [
                'total_empresas' => $total,
                'empresas_con_email' => $conEmail,
                'empresas_con_areas' => $conAreas,
                'empresas_activas' => $activos,
                'empresas_inactivas' => $inactivos,
                'porcentaje_email' => $total > 0 ? round(($conEmail / $total) * 100, 2) : 0,
                'porcentaje_areas' => $total > 0 ? round(($conAreas / $total) * 100, 2) : 0,
                'porcentaje_activas' => $total > 0 ? round(($activos / $total) * 100, 2) : 0,
                'porcentaje_inactivas' => $total > 0 ? round(($inactivos / $total) * 100, 2) : 0,
                'ultima_actualizacion' => now()->format('Y-m-d H:i:s')
            ];
            
            Log::info('API: Estadísticas obtenidas', $estadisticas);
            
            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener estadísticas', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Endpoint de salud/verificación
     */
    public function health()
    {
        try {
            $status = 'healthy';
            $details = [];
            
            // Verificar conexión a base de datos
            try {
                DB::connection()->getPdo();
                $details['database'] = 'connected';
            } catch (\Exception $e) {
                $status = 'unhealthy';
                $details['database'] = 'disconnected: ' . $e->getMessage();
            }
            
            // Verificar tabla de empresas
            try {
                $empresasCount = Empresa::count();
                $details['empresas_table'] = 'exists (' . $empresasCount . ' records)';
                
                // ✅ VERIFICAR QUE EL CAMPO ESTADO EXISTE
                try {
                    $empresa = Empresa::first();
                    if ($empresa) {
                        $tieneEstado = property_exists($empresa, 'estado') || $empresa->getAttribute('estado') !== null;
                        $details['campo_estado'] = $tieneEstado ? 'exists' : 'missing';
                    } else {
                        $details['campo_estado'] = 'no_records_to_check';
                    }
                } catch (\Exception $e) {
                    $details['campo_estado'] = 'error_checking: ' . $e->getMessage();
                }
            } catch (\Exception $e) {
                $status = 'unhealthy';
                $details['empresas_table'] = 'error: ' . $e->getMessage();
            }
            
            return response()->json([
                'success' => true,
                'status' => $status,
                'timestamp' => now()->toISOString(),
                'service' => 'Empresas API',
                'version' => '1.0.0',
                'details' => $details
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Health check failed: ' . $e->getMessage()
            ], 500);
        }
    }
}