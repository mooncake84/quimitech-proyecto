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

<!-- Estilos específicos -->
<style>
.areas-section {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin: 30px 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.area-item {
    margin-bottom: 15px;
}

.area-form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 10px;
    align-items: start;
}

.area-form input,
.area-form textarea {
    margin: 0;
}

.area-form textarea {
    resize: vertical;
    min-height: 60px;
}

.btn-remove-area {
    height: 38px;
    margin-top: 0;
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid #dee2e6;
}

.form-actions .btn {
    min-width: 180px;
    padding: 12px 24px;
    font-size: 16px;
}

@media (max-width: 768px) {
    .area-form {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .form-actions .btn {
        width: 100%;
    }
}
</style>

<!-- Scripts -->
@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-nueva-empresa');
    const areasContainer = document.getElementById('areas-container');
    const btnAgregarArea = document.getElementById('btn-agregar-area');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnGuardarEmpresa = document.getElementById('btn-guardar-empresa');
    const mensajeExito = document.getElementById('mensaje-exito');
    const mensajeError = document.getElementById('mensaje-error');
    let areaCounter = 1;

    // Agregar nueva área
    btnAgregarArea.addEventListener('click', function() {
        const areaItem = document.createElement('div');
        areaItem.className = 'area-item';
        areaItem.innerHTML = `
            <div class="area-form">
                <input type="text" name="areas[${areaCounter}][nombre]" 
                       placeholder="Ej: Producción" class="form-control area-input" required>
                <textarea name="areas[${areaCounter}][descripcion]" class="form-control" rows="2" 
                          placeholder="Descripción del área"></textarea>
                <button type="button" class="btn btn-danger btn-remove-area">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        areasContainer.appendChild(areaItem);
        areaCounter++;
    });

    // Eliminar área
    areasContainer.addEventListener('click', function(e) {
        if (e.target.closest('.btn-remove-area')) {
            const areaItem = e.target.closest('.area-item');
            if (areasContainer.children.length > 1) {
                areaItem.remove();
            }
        }
    });

    // Validar formulario
    function validarFormulario(datos) {
        const errores = [];
        
        if (!datos.nombre || datos.nombre.trim() === '') {
            errores.push('El nombre de la empresa es requerido');
        }
        
        if (!datos.giro || datos.giro.trim() === '') {
            errores.push('El giro comercial es requerido');
        }
        
        if (!datos.telefono || datos.telefono.trim() === '') {
            errores.push('El teléfono es requerido');
        }
        
        if (!datos.contacto || datos.contacto.trim() === '') {
            errores.push('La persona de contacto es requerida');
        }
        
        if (!datos.direccion || datos.direccion.trim() === '') {
            errores.push('La dirección es requerida');
        }
        
        // Validar que haya al menos un área
        if (datos.areas.length === 0) {
            errores.push('Debe agregar al menos un área de contacto');
        }
        
        return errores;
    }

    // Enviar formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Deshabilitar botón
        btnGuardarEmpresa.disabled = true;
        btnGuardarEmpresa.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            // Ocultar mensajes anteriores
            mensajeExito.style.display = 'none';
            mensajeError.style.display = 'none';
            
            // Recopilar datos
            const formData = new FormData(form);
            const areas = [];
            const areaInputs = document.querySelectorAll('.area-input');
            
            areaInputs.forEach((input, index) => {
                const nombre = input.value.trim();
                const descripcion = input.closest('.area-form').querySelector('textarea').value.trim();
                if (nombre) {
                    areas.push({ 
                        nombre: nombre,
                        descripcion: descripcion 
                    });
                }
            });

            const datos = {
                nombre: formData.get('nombre'),
                giro: formData.get('giro'),
                industria: formData.get('industria'),
                telefono: formData.get('telefono'),
                email: formData.get('email'),
                contacto: formData.get('contacto'),
                direccion: formData.get('direccion'),
                notas: formData.get('notas'),
                areas: areas
            };

            // Validar
            const errores = validarFormulario(datos);
            if (errores.length > 0) {
                throw new Error(errores.join(', '));
            }

            // Enviar a la API
            const response = await fetch('/api/empresas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(datos)
            });

            const result = await response.json();

            if (result.success) {
                // Mostrar éxito
                mensajeExito.textContent = `✅ Empresa "${result.data.nombre}" registrada exitosamente con ID: ${result.data.id}`;
                mensajeExito.style.display = 'block';

                // Limpiar formulario después de 3 segundos
                setTimeout(() => {
                    form.reset();
                    areasContainer.innerHTML = `
                        <div class="area-item">
                            <div class="area-form">
                                <input type="text" name="areas[0][nombre]" placeholder="Ej: Administración" 
                                       class="form-control area-input" required>
                                <textarea name="areas[0][descripcion]" class="form-control" rows="2" 
                                          placeholder="Descripción del área"></textarea>
                                <button type="button" class="btn btn-danger btn-remove-area" disabled>
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    areaCounter = 1;
                    mensajeExito.style.display = 'none';
                    
                    // Preguntar si quiere ver la empresa
                    setTimeout(() => {
                        if (confirm('¿Deseas ver la información de la empresa recién creada?')) {
                            window.location.href = `/info-empresa?companyId=${result.data.id}`;
                        } else {
                            window.location.href = '{{ route("rastros") }}';
                        }
                    }, 1000);
                }, 3000);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            mensajeError.textContent = `❌ Error: ${error.message}`;
            mensajeError.style.display = 'block';
            
            // Scroll al error
            mensajeError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                mensajeError.style.display = 'none';
            }, 5000);
        } finally {
            btnGuardarEmpresa.disabled = false;
            btnGuardarEmpresa.innerHTML = '<i class="fas fa-save"></i> Guardar Empresa';
        }
    });

    // Botón cancelar
    btnCancelar.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cancelar? Se perderán los datos no guardados.')) {
            window.location.href = '{{ route("rastros") }}';
        }
    });

    // Sugerir áreas basadas en giro
    document.getElementById('giro').addEventListener('input', function() {
        const giro = this.value.toLowerCase();
        const primeraArea = document.querySelector('.area-input');
        
        if (primeraArea && !primeraArea.value) {
            if (giro.includes('rastro') || giro.includes('carne')) {
                primeraArea.placeholder = 'Ej: Sacrificio';
            } else if (giro.includes('quim')) {
                primeraArea.placeholder = 'Ej: Laboratorio';
            } else if (giro.includes('fabrica') || giro.includes('producción')) {
                primeraArea.placeholder = 'Ej: Producción';
            } else if (giro.includes('alimento')) {
                primeraArea.placeholder = 'Ej: Almacén';
            } else {
                primeraArea.placeholder = 'Ej: Administración';
            }
        }
    });
});
</script>
@endsection

@endsection