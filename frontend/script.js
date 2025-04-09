let citaSeleccionada = null;
document.addEventListener("DOMContentLoaded", function () {
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: "https://upb-taller-production.up.railway.app/citas/",
        dateClick: async function (info) {
            console.log("Fecha clickeada:", info.dateStr);
            await mostrarCitasPorFecha(info.dateStr);
        }
    });
    calendar.render();

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Error: status ${response.status}`);
                return null; // Retorna null en vez de lanzar error
            }
            return await response.json();
        } catch (error) {
            console.error("Error en fetch:", error);
            return null;
        }
    }

    async function mostrarCitasPorFecha(fecha) {
        try {
            const citas = await fetchData(`https://upb-taller-production.up.railway.app/citas/fecha/${fecha}`);
            if (citas.length === 0) {
                showModal("No hay citas para esta fecha");
                return;
            }
    
            let mensaje = `<h3>Citas para el ${fecha}</h3><form id="formCitas"><ul>`;
            for (const cita of citas) {
                mensaje += `
                    <li style="margin-bottom: 8px;">
                        <input type="radio" name="cita" value="${cita.id}" id="cita-${cita.id}" />
                        <label for="cita-${cita.id}">
                            Cliente ID: ${cita.id_cliente}, Servicio ID: ${cita.id_servicio}, Hora: ${cita.fecha}
                        </label>
                    </li>`;
            }
            mensaje += `</ul>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button type="button" id="generarFactura">Generar Factura</button>
                </div>
            </form>`;

            showModal(mensaje);
    
            // Esperar a que el botón se cargue en el DOM y luego asignar evento
            setTimeout(() => {
                document.getElementById("confirmarCitaSeleccionada").addEventListener("click", () => {
                    const seleccion = document.querySelector("input[name='cita']:checked");
                    if (!seleccion) {
                        alert("Selecciona una cita");
                        return;
                    }
                    citaSeleccionada = parseInt(seleccion.value);
                    showModal("✅ Cita seleccionada correctamente. Ya puedes generar la factura.");
                });
            
                document.getElementById("generarFacturaBtn").addEventListener("click", async () => {
                    const seleccion = document.querySelector("input[name='cita']:checked");
                    if (!seleccion) {
                        alert("Selecciona una cita primero para generar la factura.");
                        return;
                    }
                    const citaId = seleccion.value;
            
                    try {
                        const cita = await fetchData(`https://upb-taller-production.up.railway.app/citas/${citaId}`);
            
                        // Obtener detalles asociados
                        const cliente = await fetchData(`https://upb-taller-production.up.railway.app/clientes/${cita.id_cliente}`);
                        const carro = await fetchData(`https://upb-taller-production.up.railway.app/carros/${cita.id_carro}`);
                        const servicio = await fetchData(`https://upb-taller-production.up.railway.app/servicios/${cita.id_servicio}`);
            
                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF();
            
                        // Logo (opcional)
                        const logo = new Image();
                        logo.src = "./Logo/Logo_Empresa.png";
                        await new Promise((resolve) => (logo.onload = resolve));
                        doc.addImage(logo, "PNG", 150, 5, 50, 50);
            
                        doc.setFontSize(18);
                        doc.text("Factura de Cita", 10, 30);
            
                        doc.setFontSize(12);
                        let y = 50;
                        doc.text(`Cliente: ${cliente.nombre} (ID: ${cliente.id})`, 10, y);
                        doc.text(`Teléfono: ${cliente.telefono}`, 10, y + 6);
                        doc.text(`Dirección: ${cliente.direccion}`, 10, y + 12);
            
                        doc.text(`Carro: ${carro.marca} ${carro.modelo}`, 10, y + 20);
                        doc.text(`Placa: ${carro.placa}`, 10, y + 26);
            
                        doc.text(`Servicio: ${servicio.nombre}`, 10, y + 34);
                        doc.text(`Costo: $${cita.total}`, 10, y + 40);
                        doc.text(`Duración: ${cita.duracion_total} minutos`, 10, y + 46);
                        doc.text(`Fecha: ${new Date(cita.fecha).toLocaleString("es-CO")}`, 10, y + 52);
            
                        doc.save(`Factura_Cita_${citaId}.pdf`);
                        document.getElementById("modal").style.display = "none"; // Cierra el modal
                    } catch (err) {
                        //showModal("Error al generar la factura.");
                        console.error(err);
                    }
                });
            }, 100);
        } catch (error) {
            showModal("Error al obtener citas para esta fecha.");
        }
    }

    document.getElementById("generarFactura").addEventListener("click", async () => {
        const seleccion = document.querySelector("input[name='cita']:checked");
        if (!seleccion) {
            alert("Selecciona una cita");
            return;
        }
    
        citaSeleccionada = parseInt(seleccion.value);
    
        const cita = await fetchData(`https://upb-taller-production.up.railway.app/citas/${citaSeleccionada}`);
        console.log(cita);

        if (cita) {
            const servicio = await fetchData(`https://upb-taller-production.up.railway.app/servicios/${cita.id_servicio}`);
            if(servicio == 1){
                respuesta = await showPromptModal("Duración del servicio (en horas):");
                closePromptModal();
                return respuesta;
            }
            if(servicio == 2){
                respuesta = await showPromptModal("Kilometraje del carro:");
                closePromptModal();
                return respuesta; 
            }
        } else {
            showModal("❌ Error");
        }
    });

    async function populateServices() {
        try {
            const data = await fetchData("https://upb-taller-production.up.railway.app/servicios/");
            let serviceSelect = document.getElementById("service");
            data.forEach((service) => {
                let option = document.createElement("option");
                option.value = service.id;
                option.textContent = `${service.nombre} - $${service.costo}`;
                option.setAttribute("data-precio", service.costo);
                serviceSelect.appendChild(option);
            });
        } catch (error) {
            showModal("Error al cargar los servicios");
        }
    }

    document.getElementById("searchClient").addEventListener("click", async function () {
        let clientId = document.getElementById("clientId").value.trim();
        if (!clientId) {
            showModal("Ingrese un ID de cliente válido.");
            return;
        }

        try {
            let cliente = await fetchData(`https://upb-taller-production.up.railway.app/clientes/${clientId}`);
            document.getElementById("clientName").value = cliente.nombre;
            document.getElementById("clientPhone").value = cliente.telefono;
            document.getElementById("clientAddress").value = cliente.direccion;
        } catch {
            showModal("Cliente no encontrado");
            document.getElementById("clientName").value = "";
            document.getElementById("clientPhone").value = "";
            document.getElementById("clientAddress").value = "";
        }
    });

    document.getElementById("searchCar").addEventListener("click", async function () {
        let carPlate = document.getElementById("carPlate").value.trim();
        if (!carPlate) {
            showModal("Ingrese una placa válida.");
            return;
        }

        try {
            let carro = await fetchData(`https://upb-taller-production.up.railway.app/carros/placas/${carPlate}`);
            document.getElementById("carModel").value = carro.modelo || "";
            document.getElementById("carBrand").value = carro.marca || "";
            document.getElementById("carId").value = carro.id || "";
        } catch {
            showModal("Carro no encontrado. Ingrese los datos para crear uno nuevo.");
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
                showModal("Por favor, complete todos los campos obligatorios.");
                return;
            }

            if (!carId && carPlate && carModel && carBrand) {
                let nuevoCarroData = {
                    placa: carPlate,
                    modelo: carModel,
                    marca: carBrand,
                    id_cliente: clientId,
                };

                let nuevoCarroResponse = await fetch("https://upb-taller-production.up.railway.app/carros/", {
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

            let citaResponse = await fetch("https://upb-taller-production.up.railway.app/citas/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData),
            });

            if (!citaResponse.ok) {
                let errorMsg = await citaResponse.text();
                throw new Error(`Error al agendar la cita: ${errorMsg}`);
            }

            showModal("Cita agendada con éxito");
            calendar.refetchEvents();
        } catch (error) {
            showModal(error.message);
        }
    });

    populateServices();

    document.getElementById("getCitas").addEventListener("click", async function () {
        try {
            const response = await fetch("https://upb-taller-production.up.railway.app/citas/");
            if (!response.ok) {
                throw new Error("Error al obtener los datos de la API");
            }
            const citas = await response.json();
            
            if (citas.length === 0) {
                showModal("No hay citas registradas");
                return;
            }
    
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Agregar logo en la esquina superior derecha
            const logo = new Image();
            logo.src = "./Logo/Logo_Empresa.png"; // Asegúrate de que el archivo esté accesible
            await new Promise((resolve) => {
                logo.onload = resolve;
            });
            doc.addImage(logo, "PNG", 150, 5, 50, 50);
    
            doc.setFontSize(24);
            doc.text("Reporte de Citas", 10, 30);
            doc.setFontSize(12);
    
            let y = 50;
            for (const cita of citas) {
                // Obtener detalles del cliente
                const clienteResponse = await fetch(`https://upb-taller-production.up.railway.app/clientes/${cita.id_cliente}`);
                const cliente = clienteResponse.ok ? await clienteResponse.json() : { nombre: "Desconocido" };
    
                // Obtener detalles del carro
                const carroResponse = await fetch(`https://upb-taller-production.up.railway.app/carros/${cita.id_carro}`);
                const carro = carroResponse.ok ? await carroResponse.json() : { marca: "N/A", modelo: "N/A", placa: "N/A" };
    
                // Obtener detalles del servicio
                const servicioResponse = await fetch(`https://upb-taller-production.up.railway.app/servicios/${cita.id_servicio}`);
                const servicio = servicioResponse.ok ? await servicioResponse.json() : { nombre: "Desconocido" };
    
                doc.text(`Cliente: ${cliente.nombre} (ID: ${cita.id_cliente})`, 10, y);
                doc.text(`Carro: ${carro.marca} ${carro.modelo} - Placa: ${carro.placa}`, 10, y + 6);
                doc.text(`Servicio: ${servicio.nombre} - Costo: $${cita.total}`, 10, y + 12);
                doc.text(`Duración: ${cita.duracion_total} min`, 10, y + 18);
                doc.text(`Fecha: ${cita.fecha}`, 10, y + 24);
                doc.line(10, y + 26, 200, y + 26);
                y += 30;
                
                if (y > 270) { // Salto de página si es necesario
                    doc.addPage();
                    y = 20;
                }
            }
    
            doc.save("reporte_citas.pdf");
        } catch (error) {
            console.error("Error al generar el reporte:", error);
            showModal("Hubo un problema al generar el reporte");
        }
    });
    
    
});
