<?php
session_start();
require_once 'api/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = md5($_POST['password']); // Kullanıcının istediği üzere MD5

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ? AND role = 'admin'");
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['admin'] = $user;
        header("Location: /admin/index.php");
        exit;
    } else {
        $error = "Geçersiz bilgiler.";
    }
}
?>
<!DOCTYPE html>
<html>
<head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
    <form method="POST" class="bg-white p-8 rounded shadow-md">
        <h2 class="text-2xl mb-4">Admin Girişi</h2>
        <?php if (isset($error)) echo "<p class='text-red-500'>$error</p>"; ?>
        <input type="email" name="email" placeholder="Email" class="w-full p-2 mb-4 border" required>
        <input type="password" name="password" placeholder="Şifre" class="w-full p-2 mb-4 border" required>
        <button type="submit" class="w-full bg-orange-600 text-white p-2">Giriş</button>
    </form>
</body>
</html>
