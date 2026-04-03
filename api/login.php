<?php
session_start();
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];
    $password = $data['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user'] = ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']];
        echo json_encode(['message' => 'Giriş başarılı', 'user' => $_SESSION['user']]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Geçersiz bilgiler']);
    }
}
?>
