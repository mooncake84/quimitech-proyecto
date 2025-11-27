<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AreaContacto extends Model
{
    use HasFactory;

    protected $table = 'areas_contacto';
    
    protected $fillable = [
        'empresa_id',
        'area',
        'producto_requerido',
        'encargado',
        'puesto',
        'correo',
        'telefono',
        'created_at',
        'updated_at'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}