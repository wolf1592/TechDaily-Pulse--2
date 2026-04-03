<?php
session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: /login.php");
    exit;
}
require_once 'header.php';
?>

<h1>Admin Paneli</h1>
<p>Hoş geldin, <?php echo htmlspecialchars($_SESSION['user']['email']); ?></p>
<a href="/api/logout.php">Çıkış Yap</a>

<?php require_once 'footer.php'; ?>
