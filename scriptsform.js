//Este archivo contiene todos los scripts del lado del cliente para la pagina firma.html. Algunos, como todos los relacionados al cambio de idioma se comparten con scriptsprincs.js

//Constantes para los botones que modifican el formulario y el select de idioma
const cookieName = 'site_language=';
const selectLanguage = document.getElementById('select-lenguaje');
const form = document.getElementById('formulario');
const personButton = document.getElementById('person');
const orgformButton = document.getElementById('orgform');



//Esta funcion recibe como prametro un idioma y hace una peticion mediante fetch por el JSON de dicho idioma
//Acto seguido  recorre todos los elementos del DOM por data-key cambiando su contenido o placeholder dependiendo si son texto o input por el del archivo JSON.
function setlanguage(lang) {
    fetch(`lang/${lang}firma.json`)
        .then(response => response.json())
        .then(data => {
            document.querySelectorAll('[data-key]').forEach(element => {
                const key = element.getAttribute('data-key');
                if (data[key]) {
                    if (element.hasAttribute('placeholder')) {
                        element.placeholder = data[key];
                    } else {
                        element.textContent = data[key];
                    }
                }
            });
        });
}

//Esta funcion checkea si existe la cookie de idioma, si no la setea por default en español. 
//Caso que exista dependiendo de su valor llama a setlanguage() con su respectivo parametro.
//Tambien llama a tarjeta para recargar el contenido de la misma
function language() {
    const cookieString = document.cookie;
    const cookieStart = cookieString.indexOf(cookieName);
    const cookieEnd = cookieString.indexOf(';', cookieStart);

    if (cookieStart !== -1) {
        const cookieValue = cookieString.substring(cookieStart + cookieName.length, cookieEnd === -1 ? undefined : cookieEnd);
        if (cookieValue === "spanish") {
            setlanguage('spanish');
        } else {
            setlanguage('english');
        }
    } else {
        document.cookie = "site_language=spanish";
        window.location.reload();
    }
}

//Estas dos funciones cambian el valor de la cookie cuando el usuario usa el respectivo select, luego llama a language() para efectivizar el cambio de idioma

function cambioen() {
    document.cookie = "site_language=english";
    language();
    window.location.reload();
}

function cambioes() {
    document.cookie = "site_language=spanish";
    language();
    window.location.reload();
}

//Con esta funcion nos aseguramos de checkear que valor se eligio en el select para llamar al respectivo cambio()

function handleLanguageChange() {
    const selectedLanguage = selectLanguage.value;
    if (selectedLanguage === "english") {
        cambioen();
    } else {
        cambioes();
    }
}

//Esta funcion modifica el contenido del formulario para personas
function person() {
    form.innerHTML = `
        <input type="text" name="nombre" id="nombre" placeholder="" data-key="nombre" minlength="4" required autocomplete="off">
        <div class="error" id="errorNombre"></div><br>
        <input type="text" name="apellido" id="ape" placeholder="" data-key="ape" minlength="5" required autocomplete="off">
        <div class="error" id="errorApe"></div><br>
        <input type="text" name="organizacion" id="org" placeholder="" data-key="org" minlength="3" required autocomplete="off">
        <div class="error" id="errorOrg"></div><br>
        <input type="email" name="mail" id="mail" placeholder="" data-key="mail" minlength="10" required autocomplete="off">
        <div class="error" id="errorMail"></div><br>
        <input type="number" name="dni" id="dni" placeholder="" data-key="dni" minlength="10" required autocomplete="off">
        <div class="error" id="errorDni"></div><br>
        <input type="checkbox" id="concent" name="concent" checked>
        <label for="concent" data-key="concenti"></label>
        <div class="error" id="errorConcent"></div>
    `;
    language();
}


//Esta funcion modifica el contenido del formulario para organizaciones
function orgform() {
    form.innerHTML = `
        <input type="text" name="organizacion" id="org" placeholder="" data-key="org" minlength="3" required autocomplete="off">
        <div class="error" id="errorOrg"></div><br>
        <input type="email" name="mail" id="mail" placeholder="" data-key="mail" minlength="10" required autocomplete="off">
        <div class="error" id="errorMail"></div><br>
        <input type="checkbox" id="concent" name="concent" checked>
        <label for="concent" data-key="concenti"></label>
        <div class="error" id="errorConcent"></div>
    `;
    language();
}


// Esta funcion valida los distintos campos del formulario, si hay error (campos vacios o valores no validos) los enseña. Caso contrario, si todo es correcto se envia al servidor
function formValid(event) {
    event.preventDefault();
    const cookieValue = getCookieValue('site_language');

    const textcamp = document.querySelectorAll('input[type="text"]');
    let correct = true;

//Recorremos los campos input de texto y chequeamos si estan o no vacios, mostrando un errror
    textcamp.forEach(campo => {
        let errorCampo = document.getElementById('error' + campo.id.charAt(0).toUpperCase() + campo.id.slice(1)); // error + id con la primera en mayúscula 
        if (campo.value.length == '') {
            if (cookieValue == "english") {
                mostrarError(errorCampo, 'This field is required!');
            } else {
                mostrarError(errorCampo, '¡Este campo es requerido!');
            }
            correct = false;
        } else {
            ocultarError(errorCampo);
        }
    });

    // Validar el campo email
    const email = document.getElementById('mail');
    let errorEmail = document.getElementById('errorMail');

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { // Este regex valida que el formato del email sea válido "caracters @ caracters . caracteres"
        ocultarError(errorEmail);
    } else {
        if (cookieValue == "english") {
            mostrarError(errorEmail, 'Invalid email!');
        } else {
            mostrarError(errorEmail, '¡Mail inválido!');
        }
        correct = false;
    }

    // Validar el campo DNI solo si está presente en el formulario
    const dniField = document.getElementById('dni');
    if (dniField) {
        const dni = dniField.value;
        const errordni = document.getElementById('errorDni');
        
        if (!isNaN(dni) && dni.trim() !== '') { // Verifica si el valor no es NaN y no está vacío
            ocultarError(errordni);
        } else {
            if (cookieValue == "english") {
                mostrarError(errordni, 'no empty document!');
            } else {
                mostrarError(errordni, '¡DNI Vacio!');
            }
            correct = false;
        }
    }

    // Validar el checkbox de consentimiento
    const concent = document.getElementById('concent');
    const errorConcent = document.getElementById('errorConcent');

    if (!concent.checked) {
        if (cookieValue == "english") {
            mostrarError(errorConcent, 'Accept conditions!');
        } else {
            mostrarError(errorConcent, '¡Debes aceptar los términos y condiciones!');
        }
        correct = false;
    } else {
        ocultarError(errorConcent);
    }

    // Aqui despues de validar todo el formulario, si no hubo error se realiza la peticion mediante metodo POST para enviar el mismo al servidor y se redirige al index
    if (correct) {
        const formData = new FormData(document.querySelector('form'));
        fetch('formprocess.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text()) 
        .then(data => {
            window.location.href = 'index.html'; 
        })
        .catch(error => console.error('Error:', error));
    }

    return correct; 
}

// Modifica el display de los campos de error mostrando aquellos que esten presents
const mostrarError = (element, mensaje) => {
    if (element) {
        element.textContent = mensaje;
        element.style.display = "block";
    }
}

//Oculta los errores cuando fueron corregidos
const ocultarError = (element) => {
    if (element) {
        element.textContent = '';
        element.style.display = "none";
    }
}

// Añadir eventos de escucha para los botones
personButton.addEventListener('click', person);
orgformButton.addEventListener('click', orgform);

//Cuando carga la ventana llamamos a la funcion language para asegurarnos de que se setee el idioma correcto o el default si no lo hubo.
window.onload = function() {
    language();
    selectLanguage.addEventListener('change', handleLanguageChange);
};
