document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const container = document.getElementById('container');
    const loginBtn = document.getElementById('login-toggle');
    const registerBtn = document.getElementById('register-toggle');

    // Funcionalidad para cambiar de panel
    if (loginBtn && registerBtn) {
        registerBtn.addEventListener('click', () => {
            container.classList.add("active");
        });

        loginBtn.addEventListener('click', () => {
            container.classList.remove("active");
        });
    }

    // Cuentas predefinidas (simulando una base de datos)
    const predefinedAccounts = {
        'carlos@cuerpo.com': { password: 'carlitos', role: 'admin' },
        'user@cuerpo.com': { password: 'userpassword', role: 'user' }
    };
    
    // Carga cuentas de usuarios registrados si existen
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};

    // ---- Lógica para el REGISTRO ----
    const registerForm = document.querySelector('.form-container.sign-up form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const regEmailInput = document.querySelector('.form-container.sign-up input[type="email"]');
            const regPasswordInput = document.querySelector('.form-container.sign-up input[type="password"]');
            const registerError = document.getElementById('register-error');
            const regEmail = regEmailInput.value;
            const regPassword = regPasswordInput.value;

            registerError.textContent = '';
            registerError.style.display = 'none';
            
            // Valida si el correo ya existe
            if (predefinedAccounts[regEmail] || registeredUsers[regEmail]) {
                registerError.textContent = 'Este correo ya está registrado.';
                registerError.style.display = 'block';
                return;
            }

            // Guarda el nuevo usuario en localStorage con rol 'user'
            const newUser = {
                password: regPassword,
                role: 'user'
            };
            registeredUsers[regEmail] = newUser;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            container.classList.remove("active"); // Cambia al panel de login
        });
    }


    // ---- Lógica para el INICIO DE SESIÓN ----
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const emailInput = document.getElementById('email').value;
        const passwordInput = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');

        errorMessage.style.display = 'none';

        // Intenta autenticar con cuentas predefinidas
        if (predefinedAccounts[emailInput] && predefinedAccounts[emailInput].password === passwordInput) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userRole', predefinedAccounts[emailInput].role);
            localStorage.setItem('userEmail', emailInput);
            window.location.href = 'index.html';
            return;
        }

        // Intenta autenticar con usuarios registrados
        if (registeredUsers[emailInput] && registeredUsers[emailInput].password === passwordInput) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userRole', registeredUsers[emailInput].role);
            localStorage.setItem('userEmail', emailInput);
            window.location.href = 'index.html';
            return;
        }
        
        // Si no se encuentra en ninguna de las dos listas
        errorMessage.textContent = 'Correo electrónico o contraseña incorrectos.';
        errorMessage.style.display = 'block';
    });
});