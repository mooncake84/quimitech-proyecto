class AutoSaveManager {
    static async guardarEmpresa(datosEmpresa) {
        try {
            const response = await fetch("/api/empresas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(datosEmpresa),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(" Empresa guardada en SQL Server:", result.empresa);
                return result.empresa;
            } else {
                console.error(" Error guardando empresa:", result.message);
                return null;
            }
        } catch (error) {
            console.error(" Error de conexión:", error);
            return null;
        }
    }

    static async guardarContacto(datosContacto) {
        try {
            const response = await fetch("/api/contactos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(datosContacto),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(
                    " Contacto guardado en SQL Server:",
                    result.contacto
                );
                return result.contacto;
            } else {
                console.error(" Error guardando contacto:", result.message);
                return null;
            }
        } catch (error) {
            console.error(" Error de conexión:", error);
            return null;
        }
    }

    static async guardarActividad(datosActividad) {
        try {
            const response = await fetch("/api/actividades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(datosActividad),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(
                    "Actividad guardada en SQL Server:",
                    result.actividad
                );
                return result.actividad;
            } else {
                console.error(" Error guardando actividad:", result.message);
                return null;
            }
        } catch (error) {
            console.error(" Error de conexión:", error);
            return null;
        }
    }

    // Método para actualizar datos existentes
    static async actualizarContacto(id, datosContacto) {
        try {
            const response = await fetch(`/api/contactos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(datosContacto),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(" Contacto actualizado en SQL Server");
                return true;
            } else {
                console.error(" Error actualizando contacto:", result.message);
                return false;
            }
        } catch (error) {
            console.error(" Error de conexión:", error);
            return false;
        }
    }
}
