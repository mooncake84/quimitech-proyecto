<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\Actividad;
use App\Models\Empresa;

class ActividadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            Log::info('API: Obteniendo actividades', $request->all());
            
            $query = Actividad::with('empresa');
            
            // Filtrar por empresa si se especifica
            if ($request->has('empresa_id')) {
                $query->where('empresa_id', $request->query('empresa_id'));
            }
            
            // Filtrar por estado
            if ($request->has('estado')) {
                $query->where('estado', $request->query('estado'));
            }
            
            // Ordenar por fecha
            $query->orderBy('fecha', 'desc')
                  ->orderBy('hora', 'desc');
            
            $actividades = $query->get();
            
            // FORMATO QUE ESPERA JAVASCRIPT
            $actividadesFormateadas = $actividades->map(function($actividad) {
                return [
                    'id' => $actividad->id,
                    'empresa_id' => $actividad->empresa_id,
                    'empresa_nombre' => $actividad->empresa ? $actividad->empresa->nombre : 'Desconocida',
                    'fecha' => $actividad->fecha,
                    'hora' => $actividad->hora,
                    'objetivo' => $actividad->objetivo,
                    'datos_adicionales' => $actividad->datos_adicionales,
                    'estado' => $actividad->estado,
                    'created_at' => $actividad->created_at,
                    'updated_at' => $actividad->updated_at
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $actividadesFormateadas,
                'count' => $actividades->count(),
                'message' => 'Actividades obtenidas exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener actividades', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error al obtener actividades: ' . $e->getMessage()
            ], 500);
        }
    }

  /**
 * Store a newly created resource in storage.
 */
public function store(Request $request)
{
    try {
        Log::info('API: Creando nueva actividad', $request->all());
        
        // Establecer valores por defecto
        $request->merge([
            'estado' => $request->input('estado', 'Pendiente')
        ]);
        
        $validated = $request->validate([
            'empresa_id' => 'required|integer|exists:empresas,id',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
            'objetivo' => 'required|string|max:500',
            'datos_adicionales' => 'nullable|string',
            'estado' => 'sometimes|string|in:Pendiente,Completado,Reprogramado',
        ]);
        
        // ============================================
        // VALIDACIÓN DE FECHA Y HORA MÍNIMA - CORREGIDO
        // ============================================
        $fechaActividad = $validated['fecha'];
        $horaActividad = $validated['hora'];
        
        // Obtener fecha y hora actual EN ZONA HORARIA LOCAL
        $hoy = Carbon::today('America/Mexico_City')->toDateString(); // Ajusta a tu zona
        $ahora = Carbon::now('America/Mexico_City'); // Ajusta a tu zona
        
        Log::info('API: Validación fecha/hora', [
            'fecha_actividad' => $fechaActividad,
            'hora_actividad' => $horaActividad,
            'hoy_local' => $hoy,
            'ahora_local' => $ahora->format('H:i'),
            'zona_horaria' => $ahora->timezoneName
        ]);
        
        // Validar que la fecha no sea anterior a hoy
        if ($fechaActividad < $hoy) {
            return response()->json([
                'success' => false,
                'message' => 'No se pueden programar actividades para fechas pasadas.'
            ], 422);
        }
        
        // Si la fecha es hoy, validar la hora
        if ($fechaActividad === $hoy) {
            // Crear objeto Carbon con la hora de la actividad en zona local
            $horaActividadCarbon = Carbon::createFromFormat(
                'Y-m-d H:i', 
                $fechaActividad . ' ' . $horaActividad,
                'America/Mexico_City' // Ajusta a tu zona
            );
            
            // Calcular el límite (2 horas antes de ahora)
            $limite = $ahora->copy()->subHours(2);
            
            Log::info('API: Comparación horas', [
                'hora_actividad_carbon' => $horaActividadCarbon->format('H:i'),
                'limite' => $limite->format('H:i'),
                'diferencia_horas' => $horaActividadCarbon->diffInHours($limite),
                'es_menor' => $horaActividadCarbon->lessThan($limite)
            ]);
            
            // Validar que la hora no sea menor al límite
            if ($horaActividadCarbon->lessThan($limite)) {
                // Formatear la hora mínima permitida para mostrar en el mensaje
                $horaMinimaStr = $limite->format('H:i');
                
                return response()->json([
                    'success' => false,
                    'message' => "Para la fecha de hoy, la hora mínima permitida es $horaMinimaStr (2 horas antes de la hora actual)."
                ], 422);
            }
        }
        // ============================================
        
        $actividad = Actividad::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Actividad creada exitosamente',
            'data' => $actividad
        ], 201);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('API: Error de validación al crear actividad', [
            'errors' => $e->errors()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error de validación: ' . implode(' ', array_map('current', $e->errors())),
            'errors' => $e->errors()
        ], 422);
        
    } catch (\Exception $e) {
        Log::error('API: Error al crear actividad', [
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error al crear actividad: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $actividad = Actividad::with('empresa')->find($id);
            
            if (!$actividad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Actividad no encontrada'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $actividad,
                'message' => 'Actividad obtenida exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al obtener actividad', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
 * Update the specified resource in storage.
 */
public function update(Request $request, string $id)
{
    try {
        Log::info('API: Actualizando actividad', ['id' => $id, 'data' => $request->all()]);
        
        $actividad = Actividad::find($id);
        
        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'Actividad no encontrada'
            ], 404);
        }
        
        // SOLO CAMPOS QUE EXISTEN EN LA BD
        $validated = $request->validate([
            'fecha' => 'sometimes|date',
            'hora' => 'sometimes|date_format:H:i',
            'objetivo' => 'sometimes|string|max:500',
            'datos_adicionales' => 'nullable|string',
            'estado' => 'sometimes|string|in:Pendiente,Completado,Reprogramado',
        ]);
        
        // ============================================
        // VALIDACIÓN DE FECHA Y HORA MÍNIMA (si se actualizan)
        // ============================================
        if (isset($validated['fecha']) || isset($validated['hora'])) {
            $fechaActividad = $validated['fecha'] ?? $actividad->fecha;
            $horaActividad = $validated['hora'] ?? $actividad->hora;
            
            // Obtener fecha y hora actual
            $hoy = Carbon::today()->toDateString();
            $ahora = Carbon::now();
            
            // Validar que la fecha no sea anterior a hoy
            if ($fechaActividad < $hoy) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pueden programar actividades para fechas pasadas.'
                ], 422);
            }
            
            // Si la fecha es hoy, validar la hora
            if ($fechaActividad === $hoy) {
                // Parsear la hora de la actividad
                $horaActividadCarbon = Carbon::createFromFormat('H:i', $horaActividad);
                
                // Calcular el límite (2 horas antes de ahora)
                $limite = $ahora->copy()->subHours(2);
                
                // Validar que la hora no sea menor al límite
                if ($horaActividadCarbon->lessThan($limite)) {
                    // Formatear la hora mínima permitida para mostrar en el mensaje
                    $horaMinimaStr = $limite->format('H:i');
                    
                    return response()->json([
                        'success' => false,
                        'message' => "Para la fecha de hoy, la hora mínima permitida es $horaMinimaStr (2 horas antes de la hora actual)."
                    ], 422);
                }
            }
        }
        // ============================================
        
        $actividad->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Actividad actualizada exitosamente',
            'data' => $actividad
        ]);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('API: Error de validación al actualizar actividad', [
            'id' => $id,
            'errors' => $e->errors()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error de validación: ' . implode(' ', array_map('current', $e->errors())),
            'errors' => $e->errors()
        ], 422);
        
    } catch (\Exception $e) {
        Log::error('API: Error al actualizar actividad', [
            'id' => $id,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error al actualizar actividad: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $actividad = Actividad::find($id);
            
            if (!$actividad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Actividad no encontrada'
                ], 404);
            }
            
            $actividad->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Actividad eliminada exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error al eliminar actividad', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar actividad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Filtrar actividades por fecha
     */
    public function filtrarPorFecha(Request $request)
    {
        try {
            Log::info('API: Filtrando actividades por fecha', $request->all());
            
            $validated = $request->validate([
                'fecha' => 'required|date',
                'empresa_id' => 'nullable|integer|exists:empresas,id'
            ]);
            
            $query = Actividad::with('empresa')
                ->whereDate('fecha', $validated['fecha']);
            
            if (isset($validated['empresa_id'])) {
                $query->where('empresa_id', $validated['empresa_id']);
            }
            
            $actividades = $query->orderBy('hora', 'asc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $actividades,
                'count' => $actividades->count(),
                'message' => 'Actividades filtradas por fecha exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error filtrando actividades por fecha', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error al filtrar actividades por fecha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener actividades para calendario
     */
    public function paraCalendario(Request $request)
    {
        try {
            Log::info('API: Obteniendo actividades para calendario', $request->all());
            
            $query = Actividad::with('empresa');
            
            if ($request->has('empresa_id')) {
                $query->where('empresa_id', $request->query('empresa_id'));
            }
            
            if ($request->has('mes')) {
                $query->whereMonth('fecha', $request->query('mes'));
            }
            
            if ($request->has('ano')) {
                $query->whereYear('fecha', $request->query('ano'));
            }
            
            $actividades = $query->orderBy('fecha', 'asc')
                                 ->orderBy('hora', 'asc')
                                 ->get();
            
            $eventos = $actividades->map(function($actividad) {
                // Determinar color según estado
                $color = '#3B82F6'; // Azul por defecto (Pendiente)
                if ($actividad->estado === 'Completado') {
                    $color = '#10B981'; // Verde
                } else if ($actividad->estado === 'Reprogramado') {
                    $color = '#F59E0B'; // Amarillo/Naranja
                }
                
                return [
                    'id' => $actividad->id,
                    'title' => substr($actividad->objetivo, 0, 30) . '...' . ' - ' . ($actividad->empresa ? $actividad->empresa->nombre : 'Sin empresa'),
                    'start' => $actividad->fecha . 'T' . $actividad->hora . ':00',
                    'color' => $color,
                    'extendedProps' => [
                        'empresa' => $actividad->empresa ? $actividad->empresa->nombre : 'Desconocida',
                        'objetivo' => $actividad->objetivo,
                        'estado' => $actividad->estado,
                        'datos_adicionales' => $actividad->datos_adicionales
                    ]
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $eventos,
                'count' => $eventos->count(),
                'message' => 'Actividades para calendario obtenidas exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error obteniendo actividades para calendario', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error al obtener actividades para calendario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener actividades por empresa (alias para compatibilidad)
     */
    public function porEmpresa($empresaId)
    {
        try {
            Log::info('API: Obteniendo actividades por empresa', ['empresa_id' => $empresaId]);
            
            $actividades = Actividad::with('empresa')
                ->where('empresa_id', $empresaId)
                ->orderBy('fecha', 'desc')
                ->orderBy('hora', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $actividades,
                'count' => $actividades->count(),
                'message' => 'Actividades por empresa obtenidas exitosamente'
            ]);
            
        } catch (\Exception $e) {
            Log::error('API: Error obteniendo actividades por empresa', [
                'empresa_id' => $empresaId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error al obtener actividades por empresa: ' . $e->getMessage()
            ], 500);
        }
    }
}