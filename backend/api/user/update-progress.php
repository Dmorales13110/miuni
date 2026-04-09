<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

require_once '../../db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$tabId = intval($data['tab'] ?? 0);
$exerciseIndex = intval($data['exercise_index'] ?? 0);
$completed = isset($data['completed']) ? (int)(bool)$data['completed'] : 0;
$userId = $_SESSION['user_id'];

$stmt = $pdo->prepare('
    INSERT INTO progreso (user_id, tab_id, exercise_index, completed)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE completed = VALUES(completed)
');
$stmt->execute([$userId, $tabId, $exerciseIndex, $completed]);

echo json_encode(['success' => true]);
