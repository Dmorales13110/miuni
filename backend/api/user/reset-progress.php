<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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

$tabId = intval($_GET['tab'] ?? 0);
$userId = $_SESSION['user_id'];

$stmt = $pdo->prepare('DELETE FROM progreso WHERE user_id = ? AND tab_id = ?');
$stmt->execute([$userId, $tabId]);

echo json_encode(['success' => true]);
