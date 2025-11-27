<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    use HasFactory;

    protected $table = 'actividades';
    
    protected $fillable = [
        'empresa_id',
        'fecha',
        'hora',
        'objetivo',
        'datos_adicionales',
        'estado',
        'pedido_entregado',
        'cantidad_entregada',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}