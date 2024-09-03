<?php
// Este script en PHP recupera los ultimos 5 registros con mayor importancia en la base de datos MYSQL y los ordena de forma descendiente para imprimirlos en una tabla/tarjeta


// Establece el tipo de contenido esperado a JSON
header('Content-Type: application/json'); 

// Prepara env  vars para la coneccion con la base de datos.
$user = getenv('DBUSER');
$pass = getenv('DBPASS');
$db = getenv('DATABASEP');
$host = 'localhost';  

//realiza la conexion y si falla "Connection failed"
$conexion = new mysqli($host, $user, $pass, $db);

if ($conexion->connect_error) {
    die("Connection failed: " . $conexion->connect_error);
}

//Deja preparada la query 
$query = $conexion->prepare("SELECT nom, ape, org, id, importancia FROM firmas ORDER BY importancia DESC, id DESC LIMIT 5");

// si la query falla genera un error encodeado como JSON
if (!$query) {
    die(json_encode(['error' => 'Prepare failed: ' . $conexion->error]));
}

//Realiza la query y guarda el resultado
$query->execute();
$result = $query->get_result();

//Nos guarda cada fila como un elemento de un array rows
$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

$query->close();
$conexion->close();

// Convierte el array de resultados a JSON y lo imprime
echo json_encode($rows); 
exit();
?>