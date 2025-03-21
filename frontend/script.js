document.addEventListener("DOMContentLoaded", function () {
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: "http://localhost:8000/citas/",
    });
    calendar.render();

    // Obtener los servicios desde la API
    fetch("http://localhost:8000/servicios/")
        .then((response) => response.json())
        .then((data) => {
            let serviceSelect = document.getElementById("service");
            data.forEach((service) => {
                let option = document.createElement("option");
                option.value = service.id;
                option.textContent = service.nombre;
                serviceSelect.appendChild(option);
            });
        });

    // Buscar cliente por ID y cargar sus datos
    document.getElementById("searchClient").addEventListener("click", function () {
        let clientId = document.getElementById("clientId").value.trim();
        if (!clientId) {
            alert("Ingrese un ID de cliente válido.");
            return;
        }

        fetch(`http://localhost:8000/clientes/${clientId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Cliente no encontrado");
                }
                return response.json();
            })
            .then((cliente) => {
                document.getElementById("clientName").value = cliente.nombre;
                document.getElementById("clientPhone").value = cliente.telefono;
                document.getElementById("clientAddress").value = cliente.direccion;

                // Cargar los carros del cliente
                return fetch(`http://localhost:8000/clientes/${clientId}/carros`);
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("No se encontraron carros para este cliente.");
                }
                return response.json();
            })
            .then((carros) => {
                let carSelect = document.getElementById("car");
                carSelect.innerHTML = ""; // Limpiar opciones previas
                carros.forEach((carro) => {
                    let option = document.createElement("option");
                    option.value = carro.id;
                    option.textContent = `${carro.marca} - ${carro.modelo} (${carro.placa})`;
                    carSelect.appendChild(option);
                });
            })
            .catch((error) => {
                alert(error.message);
                document.getElementById("clientName").value = "";
                document.getElementById("clientPhone").value = "";
                document.getElementById("clientAddress").value = "";
                document.getElementById("car").innerHTML = "";
            });
    });

    // Enviar formulario de cita
    document.getElementById("appointmentForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            // Capturar valores del formulario
            let clientId = document.getElementById("clientId")?.value?.trim();
            let clientName = document.getElementById("clientName")?.value?.trim();
            let clientPhone = document.getElementById("clientPhone")?.value?.trim();
            let clientAddress = document.getElementById("clientAddress")?.value?.trim();
            let serviceId = document.getElementById("service")?.value?.trim();
            let carId = document.getElementById("car")?.value?.trim();
            let date = document.getElementById("date")?.value?.trim();

            // Validar que todos los campos estén completos
            if (!clientId || !clientName || !clientPhone || !clientAddress || !serviceId || !carId || !date) {
                alert("Por favor, complete todos los campos obligatorios.");
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
                    direccion: clientAddress,
                };

                let nuevoClienteResponse = await fetch("http://localhost:8000/clientes/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevoClienteData),
                });

                if (!nuevoClienteResponse.ok) {
                    let errorMsg = await nuevoClienteResponse.text();
                    throw new Error(`Error al crear el cliente: ${errorMsg}`);
                }

                // Esperar 1 segundo antes de continuar
                await new Promise((resolve) => setTimeout(resolve, 1000));

                let confirmCliente = await fetch(`http://localhost:8000/clientes/${clientId}`);
                if (!confirmCliente.ok) {
                    throw new Error("Error al verificar la creación del cliente. Intente nuevamente.");
                }
            }

            // Obtener información del servicio
            let serviceResponse = await fetch(`http://localhost:8000/servicios/${serviceId}`);
            if (!serviceResponse.ok) {
                throw new Error("Servicio no encontrado");
            }
            let servicio = await serviceResponse.json();

            // Crear la cita con los datos obtenidos
            let appointmentData = {
                id_cliente: clientId,
                id_servicio: parseInt(serviceId),
                id_carro: parseInt(carId),
                total: servicio.costo,
                duracion_total: servicio.duracion,
                fecha: date,
            };

            let citaResponse = await fetch("http://localhost:8000/citas/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData),
            });

            if (!citaResponse.ok) {
                let errorMsg = await citaResponse.text();
                throw new Error(`Error al agendar la cita: ${errorMsg}`);
            }

            alert("Cita agendada con éxito");
            calendar.refetchEvents(); // Recargar eventos en el calendario

        } catch (error) {
            alert(error.message);
        }
    });
});
