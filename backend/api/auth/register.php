<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Usuario y contraseña requeridos']);
    exit;
}

if (strlen($username) < 3) {
    echo json_encode(['success' => false, 'error' => '❌ El usuario debe tener al menos 3 caracteres']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => '❌ El usuario ya existe. ¡Elige otro nombre!']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$email = $username . '@miuinikids.local';

$stmt = $pdo->prepare('INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)');
$stmt->execute([$username, $email, $hashedPassword]);
$userId = (int)$pdo->lastInsertId();

$_SESSION['user_id'] = $userId;
$_SESSION['username'] = $username;

echo json_encode([
    'success' => true,
    'user_id' => $userId,
    'username' => $username
]);
