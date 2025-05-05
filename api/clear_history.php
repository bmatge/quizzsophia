<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
    exit;
}

http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'message' => 'Suppression désactivée (historique géré dans Google Sheets).']);
