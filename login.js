// auth.js (o el archivo JS que uses para la lógica de usuario)
// ESTE CÓDIGO SE EJECUTA EN EL NAVEGADOR

document.addEventListener('DOMContentLoaded', () => {
    // === 1. LÓGICA DE REGISTRO ===
    const registroForm = document.getElementById('registroForm');
    
    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Detiene el envío normal del formulario

            // 1. Obtener todos los datos del formulario de registro
            const datosRegistro = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                universidad: document.getElementById('universidad').value,
                ciudad_estado: document.getElementById('ciudad_estado').value,
                linea_investigacion: document.getElementById('linea_investigacion').value,
                perfil_google_url: document.getElementById('perfil_google_url').value,
                orcid_id: document.getElementById('orcid_id').value,
                contrasena: document.getElementById('contrasena').value
            };
            
            // 2. Validación: verificar que las contraseñas coincidan
            const confirmarContrasena = document.getElementById('confirmar_contrasena').value;
            if (datosRegistro.contrasena !== confirmarContrasena) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // 3. Enviar los datos al servidor (Ruta: /api/registro)
            try {
                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosRegistro),
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
                    window.location.href = '/login.html'; // Redirige a la página de login
                } else {
                    alert(`❌ Error al registrar: ${data.error || 'Fallo desconocido.'}`);
                }

            } catch (error) {
                console.error('Error de red al registrar:', error);
                alert('Fallo de conexión con el servidor.');
            }
        });
    }


    // === 2. LÓGICA DE INICIO DE SESIÓN (LOGIN) ===
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Detiene el envío normal del formulario

            // 1. Obtener solo email y contraseña para el login
            const datosLogin = {
                email: document.getElementById('email').value,
                contrasena: document.getElementById('contrasena').value
            };
            
            // 2. Validación básica
            if (!datosLogin.email || !datosLogin.contrasena) {
                alert('Por favor, ingresa tu correo electrónico y contraseña.');
                return;
            }

            // 3. Enviar los datos al servidor (Ruta: /api/login)
            try {
                const respuesta = await fetch('/api/login', { // *** RUTA DE LOGIN ***
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosLogin),
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    alert('✅ ¡Inicio de sesión exitoso!');
                    // *** CAMBIAR ESTA RUTA POR LA PÁGINA QUE VE EL USUARIO TRAS INICIAR SESIÓN ***
                    window.location.href = '/dashboard.html'; 
                } else {
                    alert(`❌ Error al iniciar sesión: ${data.error || 'Credenciales inválidas o fallo desconocido.'}`);
                }

            } catch (error) {
                console.error('Error de red al iniciar sesión:', error);
                alert('Fallo de conexión con el servidor.');
            }
        });
    }
});