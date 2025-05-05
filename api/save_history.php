<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
    exit;
}

$jsonPayload = file_get_contents('php://input');
$data = json_decode($jsonPayload, true);

if (
    !$data ||
    !isset($data['titre']) ||
    !isset($data['score']) ||
    !isset($data['total']) ||
    !isset($data['fichier']) ||
    !isset($data['userAnswers'])
) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes ou invalides.']);
    exit;
}

$entry = [
    'date' => date('Y-m-d H:i:s'),
    'titre' => $data['titre'],
    'fichier' => $data['fichier'],
    'score' => $data['score'],
    'total' => $data['total'],
    'percentage' => round(($data['score'] / $data['total']) * 100, 1),
    'userAnswers' => json_encode($data['userAnswers'], JSON_UNESCAPED_UNICODE)
];

$googleScriptUrl = 'https://script.google.com/macros/s/AKfycbx0Acnj8t8fTbIyfVUyvS85I01l10tdDLJTnvn2KbRWUATS5om4egYmKNn-z8eAczqY/exec';

$ch = curl_init($googleScriptUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($entry));
$response = curl_exec($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Échec de l’envoi vers Google Sheets.']);
    exit;
}

http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'message' => 'Historique envoyé à Google Sheets.']);
