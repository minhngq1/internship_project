<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__.'/db.php';

function json($data){ echo json_encode($data); exit; }

$method = $_SERVER['REQUEST_METHOD'];
$input = null;
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
}

$action = $input['action'] ?? ($_GET['action'] ?? 'get');
$sid = session_id();

switch ($action) {
    case 'add':
        $item = $input['item'] ?? null;
        if ($item && isset($item['id'])) {
            $pid = $mysqli->real_escape_string($item['id']);
            $qty = max(1, intval($item['qty'] ?? 1));
            // upsert
            $stmt = $mysqli->prepare("INSERT INTO cart_items (session_id, product_id, qty) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)");
            $stmt->bind_param('ssi', $sid, $pid, $qty);
            $stmt->execute();
            $stmt->close();
        }
       
    case 'get':
        $stmt = $mysqli->prepare("SELECT c.product_id, c.qty, p.name, p.price, p.img FROM cart_items c LEFT JOIN products p ON c.product_id = p.id WHERE c.session_id = ?");
        $stmt->bind_param('s', $sid);
        $stmt->execute();
        $res = $stmt->get_result();
        $cart = [];
        while ($r = $res->fetch_assoc()) $cart[] = $r;
        $stmt->close();
        json(['status'=>'ok','cart'=>$cart]);
        break;

    case 'remove':
        $id = $input['item']['id'] ?? null;
        if ($id) {
            $stmt = $mysqli->prepare("DELETE FROM cart_items WHERE session_id = ? AND product_id = ?");
            $stmt->bind_param('ss', $sid, $id);
            $stmt->execute();
            $stmt->close();
        }
        json(['status'=>'ok']);
        break;

    case 'clear':
        $stmt = $mysqli->prepare("DELETE FROM cart_items WHERE session_id = ?");
        $stmt->bind_param('s', $sid);
        $stmt->execute();
        $stmt->close();
        json(['status'=>'ok']);
        break;

    default:
        json(['status'=>'error','message'=>'unknown action']);
        break;
}
?>