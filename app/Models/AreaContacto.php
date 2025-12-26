<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AreaContacto extends Model
{
    use HasFactory;

    protected $table = 'areas_contacto';
    
    // CORREGIDO: Columnas reales según tu base de datos
    protected $fillable = [
        'empresa_id',
        'area',
        'producto',           // Tu BD tiene 'producto', no 'producto_requerido'
        'encargado',          // Tu BD tiene 'encargado', no 'nombre_contacto'
        'telefono',
        'correo',             // Tu BD tiene 'correo', no 'email'
        'puesto',
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
     * Accessor para mantener compatibilidad con código existente
     * (info_empresa_script.js usa 'nombre_contacto')
     */
    public function getNombreContactoAttribute()
    {
        return $this->encargado;
    }

    /**
     * Mutator para mantener compatibilidad
     */
    public function setNombreContactoAttribute($value)
    {
        $this->attributes['encargado'] = $value;
    }

    /**
     * Accessor para email (alias de correo)
     */
    public function getEmailAttribute()
    {
        return $this->correo;
    }

    /**
     * Mutator para email
     */
    public function setEmailAttribute($value)
    {
        $this->attributes['correo'] = $value;
    }

    /**
     * Accessor para información completa con compatibilidad
     */
    public function getInfoCompletaAttribute(): array
    {
        return [
            'id' => $this->id,
            'empresa_id' => $this->empresa_id,
            'empresa_nombre' => $this->empresa ? $this->empresa->nombre : 'Empresa no disponible',
            'area' => $this->area,
            'producto' => $this->producto,
            'nombre_contacto' => $this->encargado, // Para compatibilidad
            'encargado' => $this->encargado,       // Columna real
            'telefono' => $this->telefono,
            'correo' => $this->correo ?? 'No disponible',
            'email' => $this->correo ?? 'No disponible', // Para compatibilidad
            'puesto' => $this->puesto ?? 'No disponible',
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Scope para buscar contactos (búsqueda en todos los campos)
     */
    public function scopeBuscar($query, string $termino)
    {
        return $query->where(function($q) use ($termino) {
            $q->where('area', 'LIKE', "%{$termino}%")
              ->orWhere('producto', 'LIKE', "%{$termino}%")
              ->orWhere('encargado', 'LIKE', "%{$termino}%")
              ->orWhere('telefono', 'LIKE', "%{$termino}%")
              ->orWhere('correo', 'LIKE', "%{$termino}%")
              ->orWhere('puesto', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para contactos por empresa
     */
    public function scopePorEmpresa($query, int $empresaId)
    {
        return $query->where('empresa_id', $empresaId);
    }

    /**
     * Scope para contactos por área
     */
    public function scopePorArea($query, string $area)
    {
        return $query->where('area', $area);
    }

    /**
     * Scope para contactos por producto
     */
    public function scopePorProducto($query, string $producto)
    {
        return $query->where('producto', $producto);
    }

    /**
     * Scope para contactos con correo
     */
    public function scopeConCorreo($query)
    {
        return $query->whereNotNull('correo')->where('correo', '!=', '');
    }

    /**
     * Scope para contactos con extensión
     */
    public function scopeConExtension($query)
    {
        return $query->whereNotNull('extension')->where('extension', '!=', '');
    }

    /**
     * Método para verificar si el contacto tiene datos completos
     */
    public function getDatosCompletosAttribute(): bool
    {
        return !empty($this->area) && 
               !empty($this->encargado) && 
               !empty($this->telefono);
    }

    /**
     * Método para obtener porcentaje de completitud
     */
    public function getPorcentajeCompletitudAttribute(): float
    {
        $campos = [
            'area' => !empty($this->area),
            'producto' => !empty($this->producto),
            'encargado' => !empty($this->encargado),
            'telefono' => !empty($this->telefono),
            'correo' => !empty($this->correo),
            'puesto' => !empty($this->puesto)
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
        static::creating(function ($contacto) {
            // Asegurar que los campos opcionales sean null si están vacíos
            $contacto->producto = empty($contacto->producto) ? null : $contacto->producto;
            $contacto->correo = empty($contacto->correo) ? null : $contacto->correo;
            $contacto->puesto = empty($contacto->puesto) ? null : $contacto->puesto;
            
            // Validar unicidad (misma área y mismo encargado en la misma empresa)
            $existe = static::where('empresa_id', $contacto->empresa_id)
                ->where('area', $contacto->area)
                ->where('encargado', $contacto->encargado)
                ->exists();
            
            if ($existe) {
                throw new \Exception('Ya existe un contacto con la misma área y nombre en esta empresa');
            }
        });
        
        // Evento al actualizar
        static::updating(function ($contacto) {
            // Asegurar que los campos opcionales sean null si están vacíos
            $contacto->producto = empty($contacto->producto) ? null : $contacto->producto;
            $contacto->correo = empty($contacto->correo) ? null : $contacto->correo;
            $contacto->puesto = empty($contacto->puesto) ? null : $contacto->puesto;
            
            // Validar unicidad (excluyendo el registro actual)
            $existe = static::where('empresa_id', $contacto->empresa_id)
                ->where('area', $contacto->area)
                ->where('encargado', $contacto->encargado)
                ->where('id', '!=', $contacto->id)
                ->exists();
            
            if ($existe) {
                throw new \Exception('Ya existe otro contacto con la misma área y nombre en esta empresa');
            }
        });
    }
}