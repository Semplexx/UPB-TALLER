document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: 'http://localhost:8000/citas/', // Asegúrate de que la API devuelve las citas correctamente
    });
    calendar.render();

    // Obtener los servicios desde la API
    fetch('http://localhost:8000/servicios/')
        .then(response => response.json())
        .then(data => {
            let serviceSelect = document.getElementById('service');
            data.forEach(service => {
                let option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.nombre;
                serviceSelect.appendChild(option);
            });
        });

    // Buscar cliente por ID
    document.getElementById('searchClient').addEventListener('click', function() {
        let clientId = document.getElementById('clientId').value;
        if (clientId) {
            fetch(`http://localhost:8000/clientes/${clientId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Cliente no encontrado');
                    }
                    return response.json();
                })
                .then(cliente => {
                    document.getElementById('clientName').value = cliente.nombre;
                    document.getElementById('clientPhone').value = cliente.telefono;
                    document.getElementById('clientEmail').value = cliente.correo;
                })
                .catch(error => {
                    alert(error.message);
                    document.getElementById('clientName').value = '';
                    document.getElementById('clientPhone').value = '';
                    document.getElementById('clientEmail').value = '';
                });
        }
    });

    // Enviar formulario de cita
    document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
        event.preventDefault();
    
        try {
            // Capturar valores del formulario
            let clientId = document.getElementById('clientId')?.value?.trim();
            let clientName = document.getElementById('clientName')?.value?.trim();
            let clientPhone = document.getElementById('clientPhone')?.value?.trim();
            let clientEmail = document.getElementById('clientEmail')?.value?.trim();
            let serviceId = document.getElementById('service')?.value?.trim();
            let date = document.getElementById('date')?.value?.trim();
    
            // Validar que todos los campos estén completos
            if (!clientId || !clientName || !clientPhone || !clientEmail || !serviceId || !date) {
                alert("Por favor, complete todos los campos obligatorios.");
                return;
            }
    
            clientId = parseInt(clientId);
            if (isNaN(clientId)) {
                alert("El ID del cliente debe ser un número válido.");
                return;
            }
    
            let clienteExiste = false;
    
            // Verificar si el cliente ya existe
            let clienteResponse = await fetch(`http://localhost:8000/clientes/${clientId}`);
            if (clienteResponse.ok) {
                clienteExiste = true;
            }
    
            if (!clienteExiste) {
                // Crear el cliente si no existe
                let nuevoClienteData = {
                    id: clientId,
                    nombre: clientName,
                    telefono: clientPhone,
                    correo: clientEmail
                };
    
                let nuevoClienteResponse = await fetch('http://localhost:8000/clientes/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoClienteData)
                });
    
                if (!nuevoClienteResponse.ok) {
                    let errorMsg = await nuevoClienteResponse.text();
                    throw new Error(`Error al crear el cliente: ${errorMsg}`);
                }
    
    
                // Esperar y verificar que el cliente esté en la base de datos antes de continuar
                await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
    
                let confirmCliente = await fetch(`http://localhost:8000/clientes/${clientId}`);
                if (!confirmCliente.ok) {
                    throw new Error('Error al verificar la creación del cliente. Intente nuevamente.');
                }
            }
    
            // Obtener información del servicio
            let serviceResponse = await fetch(`http://localhost:8000/servicios/${serviceId}`);
            if (!serviceResponse.ok) {
                throw new Error('Servicio no encontrado');
            }
            let servicio = await serviceResponse.json();
    
            // Crear la cita con los datos obtenidos
            let appointmentData = {
                id_cliente: clientId,
                id_servicio: parseInt(serviceId),
                total: servicio.costo,  
                duracion_total: servicio.duracion,  
                fecha: date
            };
    
            let citaResponse = await fetch('http://localhost:8000/citas/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData)
            });
    
            if (!citaResponse.ok) {
                let errorMsg = await citaResponse.text();
                throw new Error(`Error al agendar la cita: ${errorMsg}`);
            }
    
            alert('Cita agendada con éxito');
            calendar.refetchEvents(); // Recargar eventos en el calendario
    
        } catch (error) {
            alert(error.message);
        }
    });
    
    

});
