<?php
session_set_cookie_params(0, '/');
session_name('ADMIN_SESSION');
session_start();
require_once 'api/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = md5($_POST['password']); // MD5 şifreleme

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ? AND role = 'admin'");
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['admin'] = $user;
        header("Location: admin/index.php"); // Göreceli yönlendirme
        exit;
    } else {
        $error = "Geçersiz bilgiler.";
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Admin Girişi</title>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
    <form method="POST" class="bg-white p-8 rounded shadow-md w-96">
        <h2 class="text-2xl mb-4 font-bold">Admin Girişi</h2>
        <?php if (isset($error)) echo "<p class='text-red-500 mb-4'>$error</p>"; ?>
        <input type="email" name="email" placeholder="E-posta" class="w-full p-2 mb-4 border rounded" required>
        <input type="password" name="password" placeholder="Şifre" class="w-full p-2 mb-4 border rounded" required>
        <button type="submit" class="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">Giriş Yap</button>
    </form>
</body>
</html>
