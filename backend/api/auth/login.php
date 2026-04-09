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

$stmt = $pdo->prepare(
    'SELECT id, username, password FROM usuarios WHERE (username = ? OR email = ?) AND estado = 1'
);
$stmt->execute([$username, $username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    echo json_encode([
        'success' => true,
        'user_id' => $user['id'],
        'username' => $user['username']
    ]);
} else {
    echo json_encode(['success' => false, 'error' => '❌ Usuario o contraseña incorrectos']);
}
