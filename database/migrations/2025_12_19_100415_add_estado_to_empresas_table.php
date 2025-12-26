<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('empresas', function (Blueprint $table) {
        $table->string('estado', 20)->default('activo')->after('industria');
    });
}

public function down()
{
    Schema::table('empresas', function (Blueprint $table) {
        $table->dropColumn('estado');
    });
}
};
