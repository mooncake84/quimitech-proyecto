document.addEventListener("DOMContentLoaded", function () {
    // Carrusel
    let slideIndex = 0;
    const slides = document.querySelectorAll(".carrusel-item");

    function nextSlide() {
        if (slides.length === 0) return;
        slides.forEach((slide) => slide.classList.remove("active"));
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].classList.add("active");
    }

    if (slides.length > 0) {
        slides[0].classList.add("active");
        setInterval(nextSlide, 5000);
    }

    // Validación básica del formulario
    const loginForm = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (loginForm && emailInput && passwordInput) {
        loginForm.addEventListener("submit", function (e) {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                e.preventDefault();
                alert(
                    "Por favor, completa todos los campos (Correo y Contraseña)."
                );
                return;
            }

            // Guardar en localStorage solo si los campos están llenos
            localStorage.setItem("selectedCompany", "empresa1");
        });
    }
});
