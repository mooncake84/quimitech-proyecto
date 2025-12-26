<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';
    
    /**
     * Campos que pueden ser asignados masivamente
     * SEGÚN TU CONSULTA SQL: 8 campos principales (INCLUYENDO ESTADO)
     */
    protected $fillable = [
        'nombre',        // varchar(255) - requerido
        'giro',          // varchar(200) - nullable
        'direccion',     // varchar(500) - nullable  
        'contacto',      // varchar(200) - nullable ✅ NOMBRE CORRECTO
        'telefono',      // varchar(50) - nullable
        'email',         // varchar(100) - nullable
        'industria',     // varchar(100) - nullable
        'estado'         // varchar(20) - nullable ✅ NUEVO: AGREGAR ESTADO
    
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'estado' => 'string', // ✅ AGREGAR CAST PARA ESTADO
    ];


    /**
     * Relación con contactos por área
     */
    public function areasContacto(): HasMany
    {
        return $this->hasMany(AreaContacto::class, 'empresa_id');
    }

    /**
     * Relación con áreas de la empresa
     */
    public function areas(): HasMany
    {
        return $this->hasMany(EmpresaArea::class, 'empresa_id');
    }

    /**
     * Relación con actividades
     */
    public function actividades(): HasMany
    {
        return $this->hasMany(Actividad::class, 'empresa_id');
    }

    /**
     * Accessor para información completa
     */
    public function getInfoCompletaAttribute(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'giro' => $this->giro,
            'direccion' => $this->direccion,
            'contacto' => $this->contacto,
            'telefono' => $this->telefono,
            'email' => $this->email ?? 'No disponible',
            'industria' => $this->industria ?? 'No disponible',
            'areas' => $this->areas->map(function($area) {
                return [
                    'id' => $area->id,
                    'nombre' => $area->nombre,
                    'descripcion' => $area->descripcion ?? 'Sin descripción',
                    'created_at' => $area->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $area->updated_at->format('Y-m-d H:i:s')
                ];
            })->toArray(),
            'contactos' => $this->areasContacto->map(function($contacto) {
                return [
                    'id' => $contacto->id,
                    'area' => $contacto->area,
                    'producto' => $contacto->producto,
                    'nombre_contacto' => $contacto->nombre_contacto,
                    'telefono' => $contacto->telefono,
                    'extension' => $contacto->extension ?? 'No disponible',
                    'correo' => $contacto->correo ?? 'No disponible',
                    'puesto' => $contacto->puesto ?? 'No disponible',
                    'notas' => $contacto->notas ?? 'No disponible',
                    'created_at' => $contacto->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $contacto->updated_at->format('Y-m-d H:i:s')
                ];
            })->toArray(),
            'actividades_count' => $this->actividades()->count(),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Accessor para información básica
     */
    public function getInfoBasicaAttribute(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'giro' => $this->giro,
            'contacto' => $this->contacto,
            'telefono' => $this->telefono,
            'email' => $this->email,
            'industria' => $this->industria,
            'areas_count' => $this->areas()->count(),
            'contactos_count' => $this->areasContacto()->count()
        ];
    }

    /**
     * Scope para buscar empresas
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function($q) use ($termino) {
            $q->where('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('giro', 'LIKE', "%{$termino}%")
              ->orWhere('contacto', 'LIKE', "%{$termino}%")
              ->orWhere('telefono', 'LIKE', "%{$termino}%")
              ->orWhere('email', 'LIKE', "%{$termino}%")
              ->orWhere('industria', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para empresas con email
     */
    public function scopeConEmail($query)
    {
        return $query->whereNotNull('email')->where('email', '!=', '');
    }

    /**
     * Scope para empresas con áreas
     */
    public function scopeConAreas($query)
    {
        return $query->whereHas('areas');
    }

    /**
     * Scope para empresas con contactos
     */
    public function scopeConContactos($query)
    {
        return $query->whereHas('areasContacto');
    }

    /**
     * Método para verificar si la empresa tiene datos completos
     */
    public function getDatosCompletosAttribute(): bool
    {
        return !empty($this->nombre) && 
               !empty($this->giro) && 
               !empty($this->direccion) && 
               !empty($this->contacto) && 
               !empty($this->telefono);
    }

   /**
     * Método para obtener porcentaje de completitud - ACTUALIZAR
     */
    public function getPorcentajeCompletitudAttribute(): float
    {
        $campos = [
            'nombre' => !empty($this->nombre),
            'giro' => !empty($this->giro),
            'direccion' => !empty($this->direccion),
            'contacto' => !empty($this->contacto),
            'telefono' => !empty($this->telefono),
            'email' => !empty($this->email),
            'industria' => !empty($this->industria),
            'estado' => !empty($this->estado) // ✅ AGREGAR ESTADO
        ];
        
        $completos = array_sum($campos);
        $total = count($campos);
        
        return round(($completos / $total) * 100, 2);
    }

    /**
     * Boot del modelo - ACTUALIZADO
     */
    protected static function boot()
    {
        parent::boot();
        
        // Evento al crear
        static::creating(function ($empresa) {
            // Asegurar que los campos opcionales sean null si están vacíos
            $empresa->email = empty($empresa->email) ? null : $empresa->email;
            $empresa->industria = empty($empresa->industria) ? null : $empresa->industria;
            
            // ✅ ESTABLECER VALOR POR DEFECTO PARA ESTADO SI NO SE ESPECIFICA
            if (empty($empresa->estado)) {
                $empresa->estado = 'activo';
            }
        });
        
        // Evento al actualizar
        static::updating(function ($empresa) {
            // Asegurar que los campos opcionales sean null si están vacíos
            $empresa->email = empty($empresa->email) ? null : $empresa->email;
            $empresa->industria = empty($empresa->industria) ? null : $empresa->industria;
            
            // ✅ Asegurar que estado siempre tenga valor válido
            if (empty($empresa->estado)) {
                $empresa->estado = 'activo';
            }
        });
    }
}