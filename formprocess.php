<?php
//Este script  en php recibe el input del usuario mediante metodo POST, lo sanitiza, filtra y de sre posible castea  su tipo de dato esperado por seguridad
// conecta con la base de datos de MYSQL en base a las variables de entorno del servidor web. 
//Hace un select para verificar que no exista un registro repetido y si eso no ocurre inserta el nuevo registro en la tabla.



// Recuperamos el valor del input de usuario y lo sanitizamos, filtramos y cuando es posible casteamos a su tipo de dato esperado por seguridad XSS
$Nom = filter_input(INPUT_POST, 'nombre', FILTER_SANITIZE_STRING);
$Nom = htmlspecialchars($Nom);
$ape = filter_input(INPUT_POST, 'apellido', FILTER_SANITIZE_STRING);
$ape = htmlspecialchars($ape);
$mail = filter_input(INPUT_POST, 'mail', FILTER_SANITIZE_STRING);
$mail = htmlspecialchars($mail);
$org = filter_input(INPUT_POST, 'organizacion', FILTER_SANITIZE_STRING);
$org = htmlspecialchars($org);
$dni = filter_input(INPUT_POST, 'dni', FILTER_SANITIZE_NUMBER_INT);
$dni = intval(htmlspecialchars($dni));

// preparamos las env vars para la conexion a la base de datos
$user = getenv('DBUSER');
$pass = getenv('DBPASS');
$db = getenv('DATABASEP');
$host = 'localhost';  

//conectamos a la base de datos
$conexion = new mysqli($host, $user, $pass, $db);

// si hay error "Connection failed"
if ($conexion->connect_error) {
    die("Connection failed: " . $conexion->connect_error);
}


//Controlamos que este la casilla de consentimiento
if (isset($_POST['concent']) && $_POST['concent'] == 'on') {
    // Preparar valores NULL si el input esta vacío
    $Nom = empty($Nom) ? NULL : $Nom;
    $ape = empty($ape) ? NULL : $ape;
    $dni = empty($dni) ? NULL : $dni;

    // Verificar si ya existe un registro con el mismo DNI (Personas) 
    // o con la misma organización (si el DNI es NULL y por tanto es una organizacion). Ambos usando prepared statements por seguridad SQLI
    if ($dni !== NULL) {
        $query = $conexion->prepare("SELECT COUNT(*) FROM firmas WHERE doc = ?");
        $query->bind_param("i", $dni);
    } else {
        // Verificar si ya existe un registro con la misma organización y el DNI es NULL (organizaciones)
        $query = $conexion->prepare("SELECT COUNT(*) FROM firmas WHERE org = ? AND doc IS NULL");
        $query->bind_param("s", $org);
    }

    // realiza la query del select
    $query->execute();
    $query->bind_result($count);
    $query->fetch();
    $query->close();

    // Preparar query e insertar solo si no existe un registro duplicado. Usando prepared statements por seguridad SQLI
    if ($count == 0) {
        $stmt = $conexion->prepare("INSERT INTO firmas (doc, mail, org, ape, nom) VALUES (?, ?, ?, ?, ?)");
        
        //Realiza la query del insert
        $stmt->bind_param("issss", $dni, $mail, $org, $ape, $Nom);
        $stmt->execute();
        $stmt->close();
    }
}

$conexion->close();
exit();
?>