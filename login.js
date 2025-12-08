// login-cliente.js
// ESTE CÓDIGO SE EJECUTA EN EL NAVEGADOR

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el formulario (Asume que tu formulario tiene el id="registroForm")
    const registroForm = document.getElementById('registroForm');

    // 2. Escuchar el evento de envío del formulario
    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Detiene el envío normal del formulario

            // 3. Obtener todos los datos del formulario
            const datosRegistro = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                universidad: document.getElementById('universidad').value,
                ciudad_estado: document.getElementById('ciudad_estado').value,
                linea_investigacion: document.getElementById('linea_investigacion').value,
                perfil_google_url: document.getElementById('perfil_google_url').value,
                orcid_id: document.getElementById('orcid_id').value,
                contrasena: document.getElementById('contrasena').value // Nota: No envíes 'Confirmar Contraseña'
            };
            
            // Lógica de validación básica: verifica que las contraseñas coincidan aquí antes de enviar.
            if (datosRegistro.contrasena !== document.getElementById('confirmar_contrasena').value) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // 4. Enviar los datos al servidor (ruta POST en server.js)
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
                    alert('✅ ¡Registro exitoso! Ya puedes iniciar sesión.');
                    window.location.href = '/login'; // Redirige a la página de login
                } else {
                    alert(`❌ Error al registrar: ${data.error || 'Fallo desconocido.'}`);
                }

            } catch (error) {
                console.error('Error de red:', error);
                alert('Fallo de conexión con el servidor.');
            }
        });
    }
});