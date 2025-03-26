document.addEventListener("DOMContentLoaded", function () {
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: "http://localhost:8000/citas/",
    });
    calendar.render();

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error fetching data");
        }
        return response.json();
    }

    async function populateServices() {
        try {
            const data = await fetchData("http://localhost:8000/servicios/");
            let serviceSelect = document.getElementById("service");
            data.forEach((service) => {
                let option = document.createElement("option");
                option.value = service.id;
                option.textContent = `${service.nombre} - $${service.costo}`;
                option.setAttribute("data-precio", service.costo);
                serviceSelect.appendChild(option);
            });
        } catch (error) {
            alert("Error al cargar los servicios");
        }
    }

    document.getElementById("searchClient").addEventListener("click", async function () {
        let clientId = document.getElementById("clientId").value.trim();
        if (!clientId) {
            alert("Ingrese un ID de cliente válido.");
            return;
        }

        try {
            let cliente = await fetchData(`http://localhost:8000/clientes/${clientId}`);
            document.getElementById("clientName").value = cliente.nombre;
            document.getElementById("clientPhone").value = cliente.telefono;
            document.getElementById("clientAddress").value = cliente.direccion;
        } catch {
            alert("Cliente no encontrado");
            document.getElementById("clientName").value = "";
            document.getElementById("clientPhone").value = "";
            document.getElementById("clientAddress").value = "";
        }
    });

    document.getElementById("searchCar").addEventListener("click", async function () {
        let carPlate = document.getElementById("carPlate").value.trim();
        if (!carPlate) {
            alert("Ingrese una placa válida.");
            return;
        }

        try {
            let carro = await fetchData(`http://localhost:8000/carros/${carPlate}`);
            document.getElementById("carModel").value = carro.modelo || "";
            document.getElementById("carBrand").value = carro.marca || "";
            document.getElementById("carId").value = carro.id || "";
        } catch {
            alert("Carro no encontrado. Ingrese los datos para crear uno nuevo.");
            document.getElementById("carModel").value = "";
            document.getElementById("carBrand").value = "";
        }
    });

    document.getElementById("appointmentForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            let clientId = document.getElementById("clientId").value.trim();
            let clientName = document.getElementById("clientName").value.trim();
            let clientPhone = document.getElementById("clientPhone").value.trim();
            let clientAddress = document.getElementById("clientAddress").value.trim();
            let carPlate = document.getElementById("carPlate").value.trim();
            let carModel = document.getElementById("carModel").value.trim();
            let carBrand = document.getElementById("carBrand").value.trim();
            let carId = document.getElementById("carId").value.trim();
            let serviceSelect = document.getElementById("service");
            let serviceId = serviceSelect.value.trim();
            let date = document.getElementById("date").value.trim();

            if (!clientName || !clientPhone || !clientAddress || !serviceId || !date) {
                alert("Por favor, complete todos los campos obligatorios.");
                return;
            }

            if (!carId && carPlate && carModel && carBrand) {
                let nuevoCarroData = {
                    placa: carPlate,
                    modelo: carModel,
                    marca: carBrand,
                    id_cliente: clientId,
                };

                let nuevoCarroResponse = await fetch("http://localhost:8000/carros/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevoCarroData),
                });

                if (!nuevoCarroResponse.ok) {
                    let errorMsg = await nuevoCarroResponse.text();
                    throw new Error(`Error al crear el carro: ${errorMsg}`);
                }

                let nuevoCarro = await nuevoCarroResponse.json();
                carId = nuevoCarro.id;
            }

            // 🔑 Obtener el precio del servicio seleccionado
            let selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
            let total = parseFloat(selectedOption.getAttribute("data-precio")) || 0;

            let appointmentData = {
                id_cliente: clientId,
                id_servicio: parseInt(serviceId),
                id_carro: carId,
                fecha: date,
                total: total, // Actualizado con el precio del servicio
                duracion_total: 30 // O el valor necesario según tu modelo
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
            calendar.refetchEvents();
        } catch (error) {
            alert(error.message);
        }
    });

    populateServices();
});
