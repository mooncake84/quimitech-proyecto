@extends('layouts.app')

@section('title', 'Registro de Nueva Empresa')

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="header-section">
        <div class="header-content">
            <div class="header-left">
                <h1><i class="fas fa-building"></i> Registro de Nueva Empresa</h1>
                <p>Complete el formulario para registrar una nueva empresa cliente</p>
            </div>
            <div class="header-right">
                <div class="empresa-info">
                    <span id="nombre-empresa-actual">Empresa Actual: {{ Auth::user()->name ?? 'Usuario' }}</span>
                </div>
                <a href="{{ route('rastros') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Volver al Menú
                </a>
            </div>
        </div>
    </div>

    <!-- Mensajes de estado -->
    <div id="mensaje-exito" class="alert alert-success" style="display: none;"></div>
    <div id="mensaje-error" class="alert alert-danger" style="display: none;"></div>

    <!-- Formulario de registro -->
    <div class="card shadow-lg">
        <div class="card-header bg-primary text-white">
            <h3 class="mb-0"><i class="fas fa-file-alt"></i> Información General de la Empresa</h3>
        </div>
        <div class="card-body">
            <form id="form-nueva-empresa">
                @csrf
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nombre"><i class="fas fa-font"></i> Nombre de la Empresa *</label>
                            <input type="text" id="nombre" name="nombre" class="form-control" required 
                                   placeholder="Ej: Rastro Torreón S.A. de C.V.">
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="giro"><i class="fas fa-industry"></i> Giro Comercial *</label>
                            <input type="text" id="giro" name="giro" class="form-control" required 
                                   placeholder="Ej: Procesamiento de Carnes">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="industria"><i class="fas fa-cogs"></i> Industria</label>
                            <select id="industria" name="industria" class="form-control">
                                <option value="">Seleccione una industria</option>
                                <option value="Alimentaria">Alimentaria</option>
                                <option value="Química">Química</option>
                                <option value="Farmacéutica">Farmacéutica</option>
                                <option value="Manufactura">Manufactura</option>
                                <option value="Servicios">Servicios</option>
                                <option value="Comercio">Comercio</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="rfc"><i class="fas fa-id-card"></i> RFC</label>
                            <input type="text" id="rfc" name="rfc" class="form-control" 
                                   placeholder="Ej: ABC123456XYZ">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="telefono"><i class="fas fa-phone"></i> Teléfono *</label>
                            <input type="tel" id="telefono" name="telefono" class="form-control" required 
                                   placeholder="Ej: 8711234567">
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="email"><i class="fas fa-envelope"></i> Email</label>
                            <input type="email" id="email" name="email" class="form-control" 
                                   placeholder="Ej: contacto@empresa.com">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="contacto"><i class="fas fa-user"></i> Persona de Contacto *</label>
                            <input type="text" id="contacto" name="contacto" class="form-control" required 
                                   placeholder="Ej: Ing. Juan Pérez">
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="representante"><i class="fas fa-user-tie"></i> Representante Legal</label>
                            <input type="text" id="representante" name="representante" class="form-control" 
                                   placeholder="Ej: Lic. María González">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="direccion"><i class="fas fa-map-marker-alt"></i> Dirección Completa *</label>
                    <textarea id="direccion" name="direccion" class="form-control" rows="3" required 
                              placeholder="Ej: Blvd. Independencia 123, Col. Centro, Torreón, Coahuila, C.P. 27000"></textarea>
                </div>

                <div class="form-group">
                    <label for="notas"><i class="fas fa-sticky-note"></i> Notas Adicionales</label>
                    <textarea id="notas" name="notas" class="form-control" rows="3" 
                              placeholder="Información adicional relevante sobre la empresa..."></textarea>
                </div>

                <!-- Sección de Áreas -->
                <div class="areas-section">
                    <div class="section-header">
                        <h4><i class="fas fa-sitemap"></i> Áreas de Contacto</h4>
                        <button type="button" id="btn-agregar-area" class="btn btn-outline-primary">
                            <i class="fas fa-plus"></i> Agregar Área
                        </button>
                    </div>
                    
                    <div id="areas-container">
                        <div class="area-item">
                            <div class="area-form">
                                <input type="text" name="areas[0][nombre]" placeholder="Ej: Administración" 
                                       class="form-control area-input">
                                <textarea name="areas[0][descripcion]" class="form-control" rows="2" 
                                          placeholder="Descripción del área"></textarea>
                                <button type="button" class="btn btn-danger btn-remove-area" disabled>
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <button type="submit" id="btn-guardar-empresa" class="btn btn-success btn-lg">
                        <i class="fas fa-save"></i> Guardar Empresa
                    </button>
                    
                    <button type="button" id="btn-cancelar" class="btn btn-outline-secondary btn-lg">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
