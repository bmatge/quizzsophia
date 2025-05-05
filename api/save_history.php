<?php
// Fichier: /volume1/web/quiz/api/save_history.php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
    exit;
}

$jsonPayload = file_get_contents('php://input');
$data = json_decode($jsonPayload, true);

// *** MODIFIÉ : Vérifier les nouvelles données ***
if (!$data || !isset($data['titre']) || !isset($data['score']) || !isset($data['total']) || !isset($data['fichier']) || !isset($data['userAnswers'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes ou invalides (titre, score, total, fichier, userAnswers requis).']);
    exit;
}

$historyFilePath = __DIR__ . '/../data/history.json';
$history = [];

if (file_exists($historyFilePath)) {
    $historyJson = file_get_contents($historyFilePath);
    if (!empty($historyJson)) {
        $decodedHistory = json_decode($historyJson, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decodedHistory)) {
            $history = $decodedHistory;
        } else {
            error_log("Erreur de décodage JSON dans $historyFilePath");
            // Gérer l'erreur comme avant (ex: repartir de zéro ou renvoyer 500)
        }
    }
}

// *** MODIFIÉ : Préparer la nouvelle entrée avec plus de données ***
$newEntry = [
    'titre' => htmlspecialchars($data['titre']),
    'fichier' => htmlspecialchars($data['fichier']), // <-- Ajouté
    'score' => intval($data['score']),
    'total' => intval($data['total']),
    'percentage' => round((intval($data['score']) / intval($data['total'])) * 100, 1),
    'date' => date('d/m/Y H:i:s'),
    'userAnswers' => $data['userAnswers'] // <-- Ajouté (Assurez-vous que c'est bien un objet/tableau)
];

$history[] = $newEntry;
$newHistoryJson = json_encode($history, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (file_put_contents($historyFilePath, $newHistoryJson, LOCK_EX) === false) {
    http_response_code(500);
    error_log("Impossible d'écrire dans le fichier $historyFilePath - Vérifiez les permissions !");
    echo json_encode(['status' => 'error', 'message' => 'Erreur interne du serveur lors de la sauvegarde.']);
    exit;
}

http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'message' => 'Historique sauvegardé.']);

?>