<?php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__.'/db.php';

$result = $mysqli->query("SELECT id, name, price, `desc`, img FROM products");
$products = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    $result->free();
}

echo json_encode($products, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
?>