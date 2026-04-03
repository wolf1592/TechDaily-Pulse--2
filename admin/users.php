<?php
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['role'] !== 'editor') { header("Location: login.php"); exit; }
require_once '../api/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role = $_POST['role'];
    $stmt = $pdo->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
    $stmt->execute([$email, $password, $role]);
}

$users = $pdo->query("SELECT * FROM users")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto bg-white p-8 rounded shadow">
        <h2 class="text-2xl font-bold mb-6">Kullanıcılar</h2>
        <form method="POST" class="mb-8 flex gap-4">
            <input type="email" name="email" placeholder="Email" class="p-2 border rounded" required>
            <input type="password" name="password" placeholder="Şifre" class="p-2 border rounded" required>
            <select name="role" class="p-2 border rounded">
                <option value="author">Yazar</option>
                <option value="editor">Editör</option>
            </select>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Ekle</button>
        </form>
        <table class="w-full">
            <?php foreach ($users as $u): ?>
                <tr>
                    <td class="p-2 border"><?php echo htmlspecialchars($u['email']); ?></td>
                    <td class="p-2 border"><?php echo $u['role']; ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>
</body>
</html>
