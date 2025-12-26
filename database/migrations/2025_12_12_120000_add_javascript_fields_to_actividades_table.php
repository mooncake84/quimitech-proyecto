<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddJavaScriptFieldsToActividadesTable extends Migration
{
    public function up()
    {
        Schema::table('actividades', function (Blueprint $table) {
            // Agregar campos que busca JavaScript (si no existen)
            if (!Schema::hasColumn('actividades', 'area')) {
                $table->string('area', 100)->nullable()->after('empresa_id');
            }

            if (!Schema::hasColumn('actividades', 'tipo')) {
                $table->string('tipo', 100)->nullable()->after('area');
            }

            if (!Schema::hasColumn('actividades', 'descripcion')) {
                $table->string('descripcion', 500)->nullable()->after('tipo');
            }

            if (!Schema::hasColumn('actividades', 'responsable')) {
                $table->string('responsable', 200)->nullable()->after('estado');
            }
        });

        // Actualizar valores de estado existentes (fuera del closure de Schema)
        DB::table('actividades')
            ->where('estado', 'Completado')
            ->update(['estado' => 'Completada']);
    }

    public function down()
    {
        Schema::table('actividades', function (Blueprint $table) {
            // Eliminar columnas si existen
            if (Schema::hasColumn('actividades', 'area')) {
                $table->dropColumn('area');
            }

            if (Schema::hasColumn('actividades', 'tipo')) {
                $table->dropColumn('tipo');
            }

            if (Schema::hasColumn('actividades', 'descripcion')) {
                $table->dropColumn('descripcion');
            }

            if (Schema::hasColumn('actividades', 'responsable')) {
                $table->dropColumn('responsable');
            }
        });

        // Revertir estados modificados
        DB::table('actividades')
            ->where('estado', 'Completada')
            ->update(['estado' => 'Completado']);
    }
}
