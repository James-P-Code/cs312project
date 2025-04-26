<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST");
header("Access-Control-Allow-Headers: Content-Type");
include 'database_info.php';
const QUERY_SUCCESS_CODE = 201;
const QUERY_ERROR_CODE = 409;

$servername = "faure";
$username = $net_id;
$database = $net_id;
$connection = new mysqli($servername, $username, $password, $database);

if ($connection->connect_error) {
    http_response_code(403);
    die("Connection failed: " .$connection->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    handleGetRequest($connection);
} elseif ($_SERVER['REQUEST_METHOD'] == "POST") {
    handlePostRequest($connection);
}

function handleGetRequest(mysqli $connection) {
    switch ($_GET['param']) {
        case "colors": getColors($connection); break;
        case "count": getColorCount($connection); break;
    }
}

function handlePostRequest(mysqli $connection) {
    $post_data = json_decode(file_get_contents('php://input'), true);

    switch ($post_data['action']) {
        case "add": addColor($connection, $post_data);
    }
}

function getColors(mysqli $connection){
    $sql = "SELECT * FROM colors ORDER BY id";
    $query_result = $connection->query($sql);
    $database_data = array();

    while ($row = $query_result->fetch_assoc()) {
        $database_data[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode($database_data);
}

function getColorCount(mysqli $connection) {
    $sql = "SELECT COUNT(*) AS count FROM colors";
    $query_result = $connection->query($sql);
    $color_count = $query_result->fetch_assoc();

    header('Content-Type: application/json');
    echo json_encode(['count' => (int)$color_count['count']]);
}

function addColor(mysqli $connection, $post_data) {
    $sql = $connection->prepare("INSERT INTO colors (name, hex_value) VALUES (?, ?)");
    $name = $post_data['colorName'];
    $hex_value = $post_data['colorValue'];

    $sql->bind_param("ss", $name, $hex_value);

    $sql->execute();
    $responseCode = 0;

    header('Content-Type: application/json');
    if ($sql->errno) {
        http_response_code(400);
        echo json_encode([
            'responseCode' => $sql->errno,
            'message' => 'Database error: ' . $sql->error
        ]);
    } else {
        http_response_code(201);
        echo json_encode([
            'responseCode' => 201,
            'message' => 'Color added successfully'
        ]);
    }
}

$connection->close();
?>