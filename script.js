document.addEventListener("DOMContentLoaded", () => {
    const localForm = document.getElementById("localForm");
    const tablaLocales = document.getElementById("tablaLocales");

    // Cargar locales del localStorage al inicio
    cargarLocales();

    localForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Capturar valores del formulario
        const nombre = document.getElementById("nombre").value;
        const ubicacion = document.getElementById("ubicacion").value;
        const tamano = parseFloat(document.getElementById("tamano").value);
        const costo = parseFloat(document.getElementById("costo").value);
        const flujo = parseFloat(document.getElementById("flujo").value);
        const empleados = parseInt(document.getElementById("empleados").value);
        const sueldo = parseFloat(document.getElementById("sueldo").value);
        const porcentajeIngresantes = parseFloat(document.getElementById("porcentajeIngresantes").value);
        const inversionInicial = parseFloat(document.getElementById("inversionInicial").value);

        // Calcular valores derivados
        const sueldosTotal = (empleados * sueldo).toFixed(2);
        const clientesEstimados = (flujo * (porcentajeIngresantes / 100)).toFixed(0);
        const costoTotalInversion = (costo + parseFloat(sueldosTotal)).toFixed(2);

        // Crear objeto del local
        const local = {
            nombre,
            ubicacion,
            tamano,
            costo,
            flujo,
            sueldosTotal,
            porcentajeIngresantes,
            clientesEstimados,
            costoTotalInversion,
            inversionInicial,
        };

        // Guardar y mostrar el local
        guardarLocal(local);
        cargarLocales();
        localForm.reset();
    });

    function guardarLocal(local) {
        const locales = JSON.parse(localStorage.getItem("locales")) || [];
        locales.push(local);
        localStorage.setItem("locales", JSON.stringify(locales));
    }

    function cargarLocales() {
        const locales = JSON.parse(localStorage.getItem("locales")) || [];
        const maximos = calcularMaximos(locales);

        tablaLocales.innerHTML = ""; // Limpiar tabla
        locales.forEach(local => agregarLocalATabla(local, maximos));
    }

    function agregarLocalATabla(local, maximos) {
        const puntaje = calcularPuntaje(local, maximos);

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${local.nombre}</td>
            <td>${local.ubicacion}</td>
            <td>${local.tamano} m²</td>
            <td>$${local.costo}</td>
            <td>${local.flujo}</td>
            <td>${local.porcentajeIngresantes}%</td>
            <td>${local.clientesEstimados}</td>
            <td>$${local.sueldosTotal}</td>
            <td>$${local.costoTotalInversion}</td>
            <td>$${local.inversionInicial}</td>
            <td>${puntaje}</td> <!-- Mostrar puntaje -->
            <td>
                <button class="eliminar">Eliminar</button>
            </td>
        `;

        fila.querySelector(".eliminar").addEventListener("click", () => {
            eliminarLocal(local.nombre);
            fila.remove();
        });

        tablaLocales.appendChild(fila);
    }

    function eliminarLocal(nombre) {
        const locales = JSON.parse(localStorage.getItem("locales")) || [];
        const nuevosLocales = locales.filter((local) => local.nombre !== nombre);
        localStorage.setItem("locales", JSON.stringify(nuevosLocales));
        cargarLocales();
    }

    function calcularMaximos(locales) {
        return {
            costoTotalInversion: Math.max(...locales.map(local => parseFloat(local.costoTotalInversion))),
            clientesEstimados: Math.max(...locales.map(local => parseFloat(local.clientesEstimados))),
            tamano: Math.max(...locales.map(local => parseFloat(local.tamano))),
            porcentajeIngresantes: Math.max(...locales.map(local => parseFloat(local.porcentajeIngresantes))),
            inversionInicial: Math.max(...locales.map(local => parseFloat(local.inversionInicial))),
        };
    }

    function calcularPuntaje(local, maximos) {
        const normalizadoCosto = 10 - normalizar(local.costoTotalInversion, 0, maximos.costoTotalInversion);
        const normalizadoClientes = normalizar(local.clientesEstimados, 0, maximos.clientesEstimados);
        const normalizadoTamaño = normalizar(local.tamano, 0, maximos.tamano);
        const normalizadoPorcentaje = normalizar(local.porcentajeIngresantes, 0, maximos.porcentajeIngresantes);
        const normalizadoInversion = 10 - normalizar(local.inversionInicial, 0, maximos.inversionInicial);

        const puntaje = (normalizadoCosto * 0.3) +
                        (normalizadoClientes * 0.3) +
                        (normalizadoTamaño * 0.2) +
                        (normalizadoPorcentaje * 0.1) +
                        (normalizadoInversion * 0.1);

        return puntaje.toFixed(2);
    }

    function normalizar(valor, minimo, maximo) {
        return ((valor - minimo) / (maximo - minimo)) * 10 || 0; // Maneja divisiones por cero
    }
});
