//Este archivo contiene todos los scripts del lado del cliente necesarios para las diferentes funcionalidades de la pagina principal,

//Constantes con el nombre de la cookie y el select de idioma
const cookieName = 'site_language=';
const selectLanguage = document.getElementById('select-lenguaje');

//Esta funcion recibe como prametro un idioma y hace una peticion mediante fetch por el JSON de dicho idioma
//Acto seguido  recorre todos los elementos del DOM por data-key cambiando su contenido o placeholder dependiendo si son texto o input por el del archivo JSON.
function setlanguage(lang) {
    fetch(`lang/${lang}princ.json`)
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
    tarjeta();
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

//Esta funcion hace una peticion a recuperafirmas.php este devuelve los ultimos 5 registros por id (los mas recientes) cuya importancia sea mayor
//Luego de que obtiene su respuesta en formato JSON, parcea la misma  para usarla para llenar las filas de una tabla/tarjeta
function tarjeta() {
    fetch('recuperafirmas.php', {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const tbody = document.getElementById('respuesta');
        tbody.innerHTML = ''; // Limpiar el contenido previo

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nom !== null ? item.nom : ''}</td>
                <td>${item.ape !== null ? item.ape : ''}</td>
                <td>${item.org}</td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

//Cuando carga la ventana llamamos a la funcion language para asegurarnos de que se setee el idioma correcto o el default si no lo hubo.
//Luego ejecuta tarjeta() ciclicamente por si hubo cambios en su contenido, simula un cambio en tiempo real.
window.onload = function() {
    language();
    setInterval(tarjeta, 3 * 60 * 1000);
    selectLanguage.addEventListener('change', handleLanguageChange);
};
