<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST");
header("Access-Control-Allow-Headers: Content-Type");
include 'database_info.php';
define('QUERY_SUCCESS_CODE', 201);
define('QUERY_ERROR_CODE', 400);

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
        case "add": addColor($connection, $post_data); break;
        case "edit": editColor($connection, $post_data); break;
        case "delete": deleteColor($connection, $post_data); break;
    }
}

/* 
    Post request parameters getting the colors from the database:
    param = colors (string)
    Returns JSON in the following format:
    {
        "id": "1",
        "name": "red",
        "hex_value": "#FF0000"
    }  
*/
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

/* 
    Post request parameters getting the amount of colors in database:
    param = count (string)
    Retruns JSON in the following format:
    {
        "count": 51
    }  
*/
function getColorCount(mysqli $connection) {
    $sql = "SELECT COUNT(*) AS count FROM colors";
    $query_result = $connection->query($sql);
    $color_count = $query_result->fetch_assoc();

    header('Content-Type: application/json');
    echo json_encode(['count' => (int)$color_count['count']]);
}

/* Post request parameters for adding a color:
    action = add (string)
    colorName = name of color to add (string)
    colorValue = hex value of color to add (string)  */
function addColor(mysqli $connection, $post_data) {
    $sql = $connection->prepare("INSERT INTO colors (name, hex_value) VALUES (?, ?)");;
    $sql->bind_param("ss", $post_data['colorName'], $post_data['colorValue']);
    $sql->execute();

    sendPostResponse($sql, "Color added successfully");
}

/* Post request parameters for editing a color:
    action = edit (string)
    id = database id number of color to edit (number/integer)
    colorName = name of color (string)
    colorValue = hex value of color (string) */
function editColor(mysqli $connection, $post_data) {
    $sql = $connection->prepare("UPDATE colors SET name = ?, hex_value = ? WHERE id = ?");
    $sql->bind_param("ssi", $post_data["colorName"], $post_data["colorValue"], $post_data["id"]);
    $sql->execute();

    sendPostResponse($sql, "Color edited successfully");
}

/* Post request parameters for deleting a color:
    action = delete (string)
    id = database id number of color to delete (number/integer)
    Note, if there are <= 2 colors in the database the deletion will fail */
function deleteColor(mysqli $connection, $post_data) {
    if (isOkToDelete($connection)) {
        $sql = $connection->prepare("DELETE FROM colors WHERE id = ?");
        $sql->bind_param("i", $post_data["id"]);
        $sql->execute();

        sendPostResponse($sql, "Color deleted successfully");
    } else {
        http_response_code(QUERY_ERROR_CODE);
        echo json_encode([
            'responseCode' => QUERY_ERROR_CODE,
            'message' => 'Database must contain at least 2 colors'
        ]);
    }
}

function isOkToDelete(mysqli $connection) {
    $minimumColors = 2;
    $sql = "SELECT COUNT(*) AS count FROM colors";
    $query_result = $connection->query($sql);
    $color_count = $query_result->fetch_assoc();

    return (int)$color_count['count'] > $minimumColors;
}

function sendPostResponse($sql, $success_message) {
    header('Content-Type: application/json');
    if ($sql->errno) {
        http_response_code(QUERY_ERROR_CODE);
        echo json_encode([
            'responseCode' => $sql->errno,
            'message' => 'Database error: ' . $sql->error
        ]);
    } else {
        http_response_code(QUERY_SUCCESS_CODE);
        echo json_encode([
            'responseCode' => QUERY_SUCCESS_CODE,
            'message' => $success_message
        ]);
    }
}

$connection->close();
?>