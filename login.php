<?php
require_once 'header.php';
?>

<h1>Giriş Yap</h1>
<form action="/api/login.php" method="POST">
    <input type="email" name="email" placeholder="E-posta" required>
    <input type="password" name="password" placeholder="Şifre" required>
    <button type="submit">Giriş Yap</button>
</form>

<?php require_once 'footer.php'; ?>
