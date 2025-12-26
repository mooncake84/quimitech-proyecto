<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array
     */
    protected $fillable = [
        'nombre',
        'rfc',
        'direccion',
        'telefono',
        'contacto',
        'email',
        'estado',
        'notas'
    ];

    /**
     * Los atributos que deberían ser transformados.
     *
     * @var array
     */
    protected $casts = [
        'estado' => 'string'
    ];

    /**
     * Los valores por defecto para los atributos del modelo.
     *
     * @var array
     */
    protected $attributes = [
        'estado' => 'activo'
    ];

    /**
     * Obtener las actividades asociadas con este cliente.
     */
    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'empresa_id');
    }

    /**
     * Scope para filtrar clientes activos.
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope para filtrar clientes inactivos.
     */
    public function scopeInactivos($query)
    {
        return $query->where('estado', 'inactivo');
    }

    /**
     * Scope para buscar clientes por término.
     */
    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('rfc', 'LIKE', "%{$termino}%")
              ->orWhere('contacto', 'LIKE', "%{$termino}%")
              ->orWhere('email', 'LIKE', "%{$termino}%")
              ->orWhere('telefono', 'LIKE', "%{$termino}%");
        });
    }
}