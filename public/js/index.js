document.addEventListener("DOMContentLoaded", function () {
    const btnInicioSesion = document.getElementById("iniciar-sesion-btn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginForm = document.querySelector("form");

    // Lógica de transición del carrusel optimizada
    let slideIndex = 0;
    const slides = document.querySelectorAll(".carrusel-item");

    function nextSlide() {
        if (slides.length === 0) return;

        // Remover clase active de todos
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });

        // Avanzar índice
        slideIndex = (slideIndex + 1) % slides.length;

        // Agregar clase active al slide actual
        slides[slideIndex].classList.add("active");
    }

    // Inicializar primer slide
    if (slides.length > 0) {
        slides[0].classList.add("active");
    }

    // Intervalo del carrusel
    const carruselInterval = setInterval(nextSlide, 5000);

    // Lógica del login corregida
    if (btnInicioSesion && loginForm) {
        btnInicioSesion.addEventListener("click", function (e) {
            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                e.preventDefault();
                alert(
                    "Por favor, completa todos los campos (Correo y Contraseña)."
                );
            } else {
                localStorage.setItem("selectedCompany", "empresa1");
                // Permitir que el formulario se envíe normalmente
                // No usar preventDefault() cuando los campos están llenos
            }
        });

        // También agregar validación al enviar el formulario
        loginForm.addEventListener("submit", function (e) {
            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                e.preventDefault();
                alert(
                    "Por favor, completa todos los campos (Correo y Contraseña)."
                );
            } else {
                localStorage.setItem("selectedCompany", "empresa1");
            }
        });
    }
});
