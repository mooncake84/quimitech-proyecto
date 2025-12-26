// data.js - Gestión de datos con SQL Server - VERSIÓN CORREGIDA
class DataManager {
    static async cargarEmpresas() {
        try {
            const response = await fetch("/api/empresas");

            if (!response.ok) {
                throw new Error(
                    `Error HTTP ${response.status} cargando empresas`
                );
            }

            const resultado = await response.json();

            // IMPORTANTE: Asegurar estructura correcta
            if (resultado.success && Array.isArray(resultado.data)) {
                return resultado.data; // ← Retornar solo el array de datos
            } else {
                console.warn("⚠️ Estructura inesperada, usando array vacío");
                return []; // ← Siempre retornar array
            }
        } catch (error) {
            console.error("❌ Error cargando empresas:", error);

            // Fallback a datos locales si hay error
            return this.getEmpresasLocales();
        }
    }

    static async cargarContactosPorEmpresa(empresaId) {
        try {
            console.log(`🔍 Cargando contactos para empresa ${empresaId}...`);

            const response = await fetch(
                `/api/contactos/por-empresa/${empresaId}`
            );

            if (!response.ok) {
                throw new Error(
                    `Error HTTP ${response.status} cargando contactos`
                );
            }

            const resultado = await response.json();
            console.log(`📊 Contactos para empresa ${empresaId}:`, resultado);

            if (resultado.success && Array.isArray(resultado.data)) {
                return resultado.data;
            } else {
                console.warn(
                    "⚠️ Estructura inesperada en contactos, usando array vacío"
                );
                return [];
            }
        } catch (error) {
            console.error("❌ Error cargando contactos:", error);
            return [];
        }
    }

    static async cargarActividades(empresaId = null) {
        try {
            console.log("🔍 Cargando actividades desde API...");

            let url = "/api/actividades";
            if (empresaId) {
                url += `?empresa_id=${empresaId}`;
                console.log(
                    `🔍 Filtrando actividades por empresa: ${empresaId}`
                );
            }

            console.log("📡 URL actividades:", url);
            const response = await fetch(url);
            console.log("📡 Estado respuesta actividades:", response.status);

            if (!response.ok) {
                throw new Error(
                    `Error HTTP ${response.status} cargando actividades`
                );
            }

            const resultado = await response.json();
            console.log("📊 Resultado actividades desde API:", resultado);

            // IMPORTANTE: Asegurar estructura correcta
            if (resultado.success && Array.isArray(resultado.data)) {
                console.log(
                    `✅ ${resultado.data.length} actividades cargadas desde SQL Server`
                );
                return resultado.data; // ← Retornar solo el array de datos
            } else {
                console.warn(
                    "⚠️ Estructura inesperada en actividades, usando array vacío"
                );
                return []; // ← Siempre retornar array
            }
        } catch (error) {
            console.error("❌ Error cargando actividades:", error);
            return []; // ← Siempre retornar array vacío
        }
    }

    static async guardarEmpresa(datosEmpresa) {
        try {
            console.log("💾 Guardando empresa:", datosEmpresa);

            const empresaGuardada = await AutoSaveManager.guardarEmpresa(
                datosEmpresa
            );
            if (empresaGuardada) {
                // También guardar en localStorage como backup
                this.guardarEnLocalStorage("empresas", empresaGuardada);
                return empresaGuardada;
            }
            return null;
        } catch (error) {
            console.error("❌ Error guardando empresa:", error);
            return null;
        }
    }

    static async guardarContacto(datosContacto) {
        try {
            console.log("💾 Guardando contacto:", datosContacto);

            const contactoGuardado = await AutoSaveManager.guardarContacto(
                datosContacto
            );
            if (contactoGuardado) {
                this.guardarEnLocalStorage("contactos", contactoGuardado);
                return contactoGuardado;
            }
            return null;
        } catch (error) {
            console.error("❌ Error guardando contacto:", error);
            return null;
        }
    }

    static async guardarActividad(datosActividad) {
        try {
            console.log("💾 Guardando actividad:", datosActividad);

            const actividadGuardada = await AutoSaveManager.guardarActividad(
                datosActividad
            );
            if (actividadGuardada) {
                this.guardarEnLocalStorage("actividades", actividadGuardada);
                return actividadGuardada;
            }
            return null;
        } catch (error) {
            console.error("❌ Error guardando actividad:", error);
            return null;
        }
    }

    // Datos locales de respaldo - ACTUALIZADO
    static getEmpresasLocales() {
        console.log("🔄 Cargando empresas locales de respaldo...");
        return [
            {
                id: 1,
                nombre: "RASTRO TORREON",
                giro: "Planta de procesamiento de carnes",
                direccion:
                    "CARRETERA TORREÓN MIELERAS KM 8.5 FRACCIONAMIENTO SAN ESTEBAN",
                contacto: "S.C",
                telefono: "8717329515 y 8711698106",
                areas_contacto: [
                    {
                        id: 1,
                        empresa_id: 1,
                        area: "Sacrificio Porcino",
                        producto_requerido: "Zone 20 - ALK CL FOAM B",
                        encargado: "Ismael Mares",
                        puesto: "Ismael Mares",
                        correo: "Ivrrigm@gmail.com",
                        telefono: "8717350768",
                    },
                    {
                        id: 2,
                        empresa_id: 1,
                        area: "Calderas",
                        producto_requerido: "SAL PELEX - NPQT 20",
                        encargado: "CONRADO",
                        puesto: "S.D",
                        correo: "S.C",
                        telefono: "8713463015",
                    },
                    {
                        id: 3,
                        empresa_id: 1,
                        area: "Lavado de Viceras",
                        producto_requerido: "PG 1000 - PG 2000",
                        encargado: "Dra. Carmen Torres",
                        puesto: "S.D",
                        correo: "S.C",
                        telefono: "(55) 5123-4570",
                    },
                    {
                        id: 4,
                        empresa_id: 1,
                        area: "Charca Sanitaria",
                        producto_requerido: "QUIMISAN",
                        encargado: "Susana Castillo",
                        puesto: "S.D",
                        correo: "S.C",
                        telefono: "",
                    },
                    {
                        id: 5,
                        empresa_id: 1,
                        area: "Lavado de Rolas",
                        producto_requerido: "SUPER ML EN POLVO",
                        encargado: "MVZ ALEJANDRA RODRÍGUEZ",
                        puesto: "S.D",
                        correo: "S.C",
                        telefono: "",
                    },
                ],
            },
            {
                id: 2,
                nombre: "BioChem México",
                giro: "Productos Bioquímicos y Farmacéuticos",
                direccion: "Blvd. Tecnológico 456, Guadalajara, Jal.",
                contacto: "info@biochem.com.mx",
                telefono: "(33) 3654-7890",
                areas_contacto: [
                    {
                        id: 6,
                        empresa_id: 2,
                        area: "Control de Calidad",
                        producto_requerido:
                            "Reactivos para Análisis Microbiológico",
                        encargado: "QFB. Ana García",
                        puesto: "Especialista en Control Microbiológico - 7 años de experiencia",
                        correo: "agarcia@biochem.com.mx",
                        telefono: "(33) 3654-7891",
                    },
                ],
            },
        ];
    }

    static guardarEnLocalStorage(tipo, datos) {
        try {
            const key = `quimitech_${tipo}_backup`;
            const existentes = JSON.parse(localStorage.getItem(key) || "[]");
            existentes.push(datos);
            localStorage.setItem(key, JSON.stringify(existentes));
            console.log(`✅ Datos guardados en localStorage (${tipo})`);
        } catch (error) {
            console.error("❌ Error guardando en localStorage:", error);
        }
    }

    static cargarDesdeLocalStorage(tipo) {
        try {
            const key = `quimitech_${tipo}_backup`;
            const datos = JSON.parse(localStorage.getItem(key) || "[]");
            console.log(
                `📊 Datos cargados desde localStorage (${tipo}):`,
                datos.length
            );
            return datos;
        } catch (error) {
            console.error("❌ Error cargando desde localStorage:", error);
            return [];
        }
    }

    // Migrar datos locales a SQL Server (una sola vez)
    static async migrarDatosLocales() {
        try {
            console.log(
                "🚀 Iniciando migración de datos locales a SQL Server..."
            );

            const empresasLocales = this.getEmpresasLocales();
            let empresasMigradas = 0;
            let contactosMigrados = 0;

            for (const empresa of empresasLocales) {
                console.log(`📦 Migrando empresa: ${empresa.nombre}`);

                // Guardar empresa
                const empresaGuardada = await this.guardarEmpresa({
                    nombre: empresa.nombre,
                    giro: empresa.giro,
                    direccion: empresa.direccion,
                    contacto: empresa.contacto,
                    telefono: empresa.telefono,
                });

                if (empresaGuardada && empresa.areas_contacto) {
                    // Guardar contactos de la empresa
                    for (const contacto of empresa.areas_contacto) {
                        console.log(
                            `📋 Migrando contacto: ${contacto.encargado}`
                        );
                        await this.guardarContacto({
                            empresa_id: empresaGuardada.id,
                            area: contacto.area,
                            producto_requerido: contacto.producto_requerido,
                            encargado: contacto.encargado,
                            puesto: contacto.puesto,
                            correo: contacto.correo,
                            telefono: contacto.telefono,
                        });
                        contactosMigrados++;
                    }
                    empresasMigradas++;
                }
            }

            console.log(
                `✅ Migración completada: ${empresasMigradas} empresas, ${contactosMigrados} contactos`
            );
            return { empresas: empresasMigradas, contactos: contactosMigrados };
        } catch (error) {
            console.error("❌ Error en migración:", error);
            return { empresas: 0, contactos: 0 };
        }
    }
}

// Función para inicializar datos (ejecutar al cargar la app)
async function inicializarDatos() {
    console.log("🚀 Inicializando sistema de datos...");

    try {
        // Verificar si ya tenemos datos en SQL Server
        const empresas = await DataManager.cargarEmpresas();

        if (!empresas || empresas.length === 0) {
            console.log(
                "📊 No hay datos en SQL Server, migrando datos locales..."
            );
            await DataManager.migrarDatosLocales();
        } else {
            console.log(
                `✅ ${empresas.length} empresas encontradas en SQL Server`
            );
        }

        return empresas;
    } catch (error) {
        console.error("❌ Error inicializando datos:", error);
        return DataManager.getEmpresasLocales();
    }
}

// Función para guardar cambios en empresa
async function guardarCambiosEmpresa(empresaId, datosActualizados) {
    try {
        console.log(
            `💾 Guardando cambios empresa ${empresaId}:`,
            datosActualizados
        );

        // Si es una empresa nueva (sin ID)
        if (!empresaId || empresaId.toString().startsWith("empresa")) {
            // Crear nueva empresa
            const nuevaEmpresa = await DataManager.guardarEmpresa({
                nombre: datosActualizados.nombre,
                giro: datosActualizados.giro,
                direccion: datosActualizados.direccion,
                contacto: datosActualizados.contacto,
                telefono: datosActualizados.telefono,
            });

            if (nuevaEmpresa && datosActualizados.areas) {
                // Guardar contactos de la nueva empresa
                for (const contacto of datosActualizados.areas) {
                    await DataManager.guardarContacto({
                        empresa_id: nuevaEmpresa.id,
                        area: contacto.area,
                        producto_requerido: contacto.productoRequerido,
                        encargado: contacto.encargado,
                        puesto: contacto.puesto,
                        correo: contacto.correo,
                        telefono: contacto.telefono,
                    });
                }
            }

            return nuevaEmpresa ? true : false;
        } else {
            // Actualizar empresa existente
            const response = await fetch(`/api/empresas/${empresaId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify({
                    nombre: datosActualizados.nombre,
                    giro: datosActualizados.giro,
                    direccion: datosActualizados.direccion,
                    contacto: datosActualizados.contacto,
                    telefono: datosActualizados.telefono,
                }),
            });

            const result = await response.json();
            return result.success;
        }
    } catch (error) {
        console.error("❌ Error guardando cambios empresa:", error);
        return false;
    }
}

// Función para guardar cambios en contacto
async function guardarCambiosContacto(contactoId, datosContacto) {
    try {
        console.log(`💾 Guardando contacto ${contactoId}:`, datosContacto);

        if (!contactoId || contactoId.toString().startsWith("temp")) {
            // Nuevo contacto
            const resultado = await DataManager.guardarContacto(datosContacto);
            return resultado ? true : false;
        } else {
            // Actualizar contacto existente
            const resultado = await AutoSaveManager.actualizarContacto(
                contactoId,
                datosContacto
            );
            return resultado;
        }
    } catch (error) {
        console.error("❌ Error guardando contacto:", error);
        return false;
    }
}

// Función para cargar actividades específicas
async function cargarActividadesParaEmpresa(empresaId = null) {
    try {
        console.log(
            `🔍 Cargando actividades para empresa: ${empresaId || "Todas"}`
        );
        return await DataManager.cargarActividades(empresaId);
    } catch (error) {
        console.error("❌ Error cargando actividades para empresa:", error);
        return [];
    }
}

// Inicializar cuando se carga el script
document.addEventListener("DOMContentLoaded", function () {
    // Hacer DataManager disponible globalmente
    window.DataManager = DataManager;
    window.inicializarDatos = inicializarDatos;
    window.guardarCambiosEmpresa = guardarCambiosEmpresa;
    window.guardarCambiosContacto = guardarCambiosContacto;
    window.cargarActividadesParaEmpresa = cargarActividadesParaEmpresa;
});
