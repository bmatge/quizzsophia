<?php
// Fichier: /volume1/web/quiz/api/clear_history.php

// 1. Sécurité : S'assurer que la requête est bien POST (bonne pratique pour les actions de modification)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée. Seules les requêtes POST sont acceptées.']);
    exit;
}

// 2. Définir le chemin vers le fichier d'historique
$historyFilePath = __DIR__ . '/../data/history.json';

// 3. Vérifier si le fichier existe avant d'essayer de le vider
if (!file_exists($historyFilePath)) {
    // Le fichier n'existe pas, donc l'historique est déjà "vide". Succès.
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Historique déjà vide (fichier non trouvé).']);
    exit;
}

// 4. Vider le fichier en écrivant un tableau JSON vide ('[]')
// Utiliser LOCK_EX pour éviter les problèmes d'accès concurrents (même si peu probable ici)
$emptyHistoryJson = '[]'; // Un tableau JSON vide

if (file_put_contents($historyFilePath, $emptyHistoryJson, LOCK_EX) === false) {
     // Erreur lors de l'écriture (probablement un problème de permissions)
     http_response_code(500); // Internal Server Error
     error_log("Impossible d'écrire/vider le fichier $historyFilePath - Vérifiez les permissions !");
     echo json_encode(['status' => 'error', 'message' => 'Erreur interne du serveur lors de la suppression de l\'historique. Vérifiez les logs serveur et les permissions.']);
     exit;
}

// 5. Envoyer une réponse de succès au client
http_response_code(200); // OK
header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'message' => 'Historique effacé avec succès.']);

?>