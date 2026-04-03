<?php
// Basit bir görsel yükleme ve WebP dönüşüm scripti
if ($_FILES['file']['name']) {
    $target_dir = "../uploads/";
    $filename = time() . '_' . basename($_FILES["file"]["name"]);
    $target_file = $target_dir . $filename;
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        // WebP'ye çevir (GD kütüphanesi ile)
        if ($imageFileType == 'jpg' || $imageFileType == 'jpeg') $img = imagecreatefromjpeg($target_file);
        elseif ($imageFileType == 'png') $img = imagecreatefrompng($target_file);
        
        if (isset($img)) {
            $webp_file = $target_dir . pathinfo($filename, PATHINFO_FILENAME) . '.webp';
            imagewebp($img, $webp_file, 80);
            imagedestroy($img);
            unlink($target_file); // Orijinali sil
            echo json_encode(['location' => '/web/2/uploads/' . pathinfo($filename, PATHINFO_FILENAME) . '.webp']);
        } else {
            echo json_encode(['location' => '/web/2/uploads/' . $filename]);
        }
    }
}
?>
