<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpresaArea extends Model
{
    use HasFactory;

    protected $table = 'empresa_areas';
    
    protected $fillable = [
        'empresa_id',
        'nombre',
        'descripcion',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con la empresa
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    /**
     * Accessor para información completa
     */
    public function getInfoCompletaAttribute(): array
    {
        return [
            'id' => $this->id,
            'empresa_id' => $this->empresa_id,
            'empresa_nombre' => $this->empresa ? $this->empresa->nombre : 'Empresa no disponible',
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion ?? 'Sin descripción',
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Scope para buscar áreas
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function($q) use ($termino) {
            $q->where('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para áreas por empresa
     */
    public function scopePorEmpresa($query, int $empresaId)
    {
        return $query->where('empresa_id', $empresaId);
    }

    /**
     * Scope para áreas con descripción
     */
    public function scopeConDescripcion($query)
    {
        return $query->whereNotNull('descripcion')->where('descripcion', '!=', '');
    }

    /**
     * Método para verificar si el área tiene datos completos
     */
    public function getDatosCompletosAttribute(): bool
    {
        return !empty($this->nombre);
    }

    /**
     * Método para obtener porcentaje de completitud
     */
    public function getPorcentajeCompletitudAttribute(): float
    {
        $campos = [
            'nombre' => !empty($this->nombre),
            'descripcion' => !empty($this->descripcion)
        ];
        
        $completos = array_sum($campos);
        $total = count($campos);
        
        return round(($completos / $total) * 100, 2);
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();
        
        // Evento al crear
        static::creating(function ($area) {
            // Asegurar que la descripción sea null si está vacía
            $area->descripcion = empty($area->descripcion) ? null : $area->descripcion;
            
            // Validar unicidad por empresa
            $existe = static::where('empresa_id', $area->empresa_id)
                ->where('nombre', $area->nombre)
                ->exists();
            
            if ($existe) {
                throw new \Exception('Ya existe un área con ese nombre en esta empresa');
            }
        });
        
        // Evento al actualizar
        static::updating(function ($area) {
            // Asegurar que la descripción sea null si está vacía
            $area->descripcion = empty($area->descripcion) ? null : $area->descripcion;
            
            // Validar unicidad por empresa (excluyendo el registro actual)
            $existe = static::where('empresa_id', $area->empresa_id)
                ->where('nombre', $area->nombre)
                ->where('id', '!=', $area->id)
                ->exists();
            
            if ($existe) {
                throw new \Exception('Ya existe otra área con ese nombre en esta empresa');
            }
        });
        
        // Evento al eliminar
        static::deleting(function ($area) {
            // Aquí podrías agregar lógica adicional antes de eliminar,
            // como verificar si hay contactos asociados, etc.
        });
    }
}