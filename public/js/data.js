// data.js - Gestión de datos con SQL Server
class DataManager {
    static async cargarEmpresas() {
        try {
            const response = await fetch("/api/empresas");
            if (!response.ok) throw new Error("Error cargando empresas");

            const empresas = await response.json();
            console.log(" Empresas cargadas desde SQL Server:", empresas);
            return empresas;
        } catch (error) {
            console.error(" Error cargando empresas:", error);

            // Fallback a datos locales si hay error
            return this.getEmpresasLocales();
        }
    }

    static async cargarContactosPorEmpresa(empresaId) {
        try {
            const response = await fetch(
                `/api/empresas/${empresaId}/contactos`
            );
            if (!response.ok) throw new Error("Error cargando contactos");

            const contactos = await response.json();
            console.log(
                `Contactos cargados para empresa ${empresaId}:`,
                contactos
            );
            return contactos;
        } catch (error) {
            console.error("❌ Error cargando contactos:", error);
            return [];
        }
    }

    static async cargarActividades() {
        try {
            const response = await fetch("/api/actividades");
            if (!response.ok) throw new Error("Error cargando actividades");

            const actividades = await response.json();
            console.log(" Actividades cargadas desde SQL Server:", actividades);
            return actividades;
        } catch (error) {
            console.error(" Error cargando actividades:", error);
            return [];
        }
    }

    static async guardarEmpresa(datosEmpresa) {
        try {
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
            console.error(" Error guardando empresa:", error);
            return null;
        }
    }

    static async guardarContacto(datosContacto) {
        try {
            const contactoGuardado = await AutoSaveManager.guardarContacto(
                datosContacto
            );
            if (contactoGuardado) {
                this.guardarEnLocalStorage("contactos", contactoGuardado);
                return contactoGuardado;
            }
            return null;
        } catch (error) {
            console.error("Error guardando contacto:", error);
            return null;
        }
    }

    static async guardarActividad(datosActividad) {
        try {
            const actividadGuardada = await AutoSaveManager.guardarActividad(
                datosActividad
            );
            if (actividadGuardada) {
                this.guardarEnLocalStorage("actividades", actividadGuardada);
                return actividadGuardada;
            }
            return null;
        } catch (error) {
            console.error(" Error guardando actividad:", error);
            return null;
        }
    }

    // Datos locales de respaldo
    static getEmpresasLocales() {
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
        } catch (error) {
            console.error("Error guardando en localStorage:", error);
        }
    }
    // Métodos de utilidad para localStorage (backup)
    static guardarEnLocalStorage(tipo, datos) {
        try {
            const key = `quimitech_${tipo}_backup`;
            const existentes = JSON.parse(localStorage.getItem(key) || "[]");
            existentes.push(datos);
            localStorage.setItem(key, JSON.stringify(existentes));
        } catch (error) {
            console.error("Error guardando en localStorage:", error);
        }
    }

    static cargarDesdeLocalStorage(tipo) {
        try {
            const key = `quimitech_${tipo}_backup`;
            return JSON.parse(localStorage.getItem(key) || "[]");
        } catch (error) {
            console.error("Error cargando desde localStorage:", error);
            return [];
        }
    }

    // Migrar datos locales a SQL Server (una sola vez)
    static async migrarDatosLocales() {
        try {
            const empresasLocales = this.getEmpresasLocales();
            let empresasMigradas = 0;
            let contactosMigrados = 0;

            for (const empresa of empresasLocales) {
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
                ` Migración completada: ${empresasMigradas} empresas, ${contactosMigrados} contactos`
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
    console.log("Inicializando datos...");

    // Verificar si ya tenemos datos en SQL Server
    const empresas = await DataManager.cargarEmpresas();

    if (empresas.length === 0) {
        console.log("📦 No hay datos en SQL Server, migrando datos locales...");
        await DataManager.migrarDatosLocales();
    } else {
        console.log("✅ Datos ya existen en SQL Server");
    }

    return empresas;
}

// Función para guardar cambios (reemplaza la función original)
async function guardarCambiosEmpresa(empresaId, datosActualizados) {
    try {
        console.log(
            "💾 Guardando empresa en SQL Server:",
            empresaId,
            datosActualizados
        );

        // Si es una empresa nueva (sin ID)
        if (!empresaId || empresaId.startsWith("empresa")) {
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
        console.error("❌ Error guardando cambios:", error);
        return false;
    }
}

// Función para guardar cambios en contacto
async function guardarCambiosContacto(contactoId, datosContacto) {
    try {
        console.log("💾 Guardando contacto:", contactoId, datosContacto);

        if (!contactoId || contactoId.startsWith("temp")) {
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
        console.error("Error guardando contacto:", error);
        return false;
    }
}

// Inicializar cuando se carga el script
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 DataManager cargado - Listo para usar SQL Server");

    // Opcional: Inicializar datos automáticamente
    // inicializarDatos();
});
