// ==========================================================================
// == Quiz Application - app.js (Bouton Valider HORS formulaire)           ==
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Éléments du DOM ---
    console.log("DOM chargé. Sélection des éléments...");
    const pages = document.querySelectorAll('.page');
    const btnAccueil = document.getElementById('btn-accueil');
    const btnHistorique = document.getElementById('btn-historique');
    const btnRetourAccueilCorrection = document.getElementById('btn-retour-accueil-correction');
    const btnRetourAccueilHistorique = document.getElementById('btn-retour-accueil-historique');
    const btnEffacerHistorique = document.getElementById('btn-effacer-historique');
    const btnValiderQuiz = document.getElementById('btn-valider-quiz'); // Bouton HORS formulaire

    const accueilSection = document.getElementById('accueil');
    const questionnaireSection = document.getElementById('questionnaire');
    const correctionSection = document.getElementById('correction');
    const historiqueSection = document.getElementById('historique');

    const listeQuizUl = document.getElementById('liste-quiz');
    const quizTitreH2 = document.getElementById('quiz-titre');
    const correctionTitreH2 = correctionSection.querySelector('h2');
    const quizForm = document.getElementById('quiz-form'); // Le formulaire est toujours utile pour contenir les inputs
    const scoreP = document.getElementById('score');
    const correctionDetailsDiv = document.getElementById('correction-details');
    const listeHistoriqueUl = document.getElementById('liste-historique');

    // Vérification éléments essentiels
    if (!quizForm || !btnValiderQuiz || !listeQuizUl || !listeHistoriqueUl || !correctionTitreH2 || !scoreP || !correctionDetailsDiv) {
        console.error("Erreur critique: Un ou plusieurs éléments DOM essentiels sont manquants.");
        alert("Erreur critique au chargement. Vérifiez la console.");
        return;
    }
     if (!btnEffacerHistorique) {
        console.warn("Le bouton 'btn-effacer-historique' n'a pas été trouvé.");
     }

    // --- Variables d'état ---
    let quizzesIndex = [];
    let currentQuizData = null;
    let userAnswers = {};
    let score = 0;
    let loadedHistoryData = [];


    // --- Fonctions Utilitaires ---
    function showPage(pageId) {
        console.log(`Affichage page: ${pageId}`);
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === pageId) page.classList.add('active');
        });
        window.scrollTo(0, 0);
    }

    // --- Fonctions de Chargement Initial ---
    async function loadQuizIndex() { /* ... (Code inchangé) ... */
        console.log("1. Chargement index.json...");
        try {
            listeQuizUl.innerHTML = '<li>Chargement...</li>';
            const response = await fetch('data/index.json?nocache=' + Date.now());
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const rawText = await response.clone().text();
            console.log("5b. Index brut:", rawText);
            quizzesIndex = await response.json();
            if (!Array.isArray(quizzesIndex)) throw new Error("Format index.json invalide.");
            console.log("6. Index parsé:", quizzesIndex);
            displayQuizList();
            console.log("8. Index chargé.");
        } catch (error) {
            console.error("ERREUR loadQuizIndex:", error);
            listeQuizUl.innerHTML = `<li>Erreur chargement index (${error.message}).</li>`;
        }
    }

    function displayQuizList() { /* ... (Code inchangé) ... */
        console.log("9. Affichage liste quiz...");
        listeQuizUl.innerHTML = '';
        if (!quizzesIndex || quizzesIndex.length === 0) {
            if (listeQuizUl.innerHTML === '') listeQuizUl.innerHTML = '<li>Aucun quiz disponible.</li>';
            return;
        }
        quizzesIndex.forEach((quizInfo) => {
            if (!quizInfo || !quizInfo.titre || !quizInfo.fichier) {
                console.warn("Entrée index.json invalide:", quizInfo); return;
            }
            const li = document.createElement('li');
            li.innerHTML = `<span>${quizInfo.titre}</span><button data-quiz-file="${quizInfo.fichier}">Commencer</button>`;
            li.querySelector('button').addEventListener('click', () => startQuiz(quizInfo.fichier));
            listeQuizUl.appendChild(li);
        });
        console.log("10. Liste quiz affichée.");
    }

    // --- Fonctions de Gestion du Quiz ---
    async function startQuiz(quizFileName) { /* ... (Code inchangé) ... */
        console.log(`Démarrage quiz: ${quizFileName}`);
        try {
            currentQuizData = null; userAnswers = {}; score = 0;
            const response = await fetch(`data/${quizFileName}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            currentQuizData = await response.json();
            if (!currentQuizData || !currentQuizData.titre || !Array.isArray(currentQuizData.questions)) throw new Error("Format JSON quiz invalide.");
            currentQuizData.fichier = quizFileName;
            console.log("Quiz chargé:", currentQuizData.titre);
            displayQuiz();
            showPage('questionnaire');
        } catch (error) {
            console.error(`Erreur chargement quiz ${quizFileName}:`, error);
            alert(`Erreur chargement quiz "${quizFileName}" (${error.message}).`);
            showPage('accueil');
        }
     }

    function displayQuiz() { /* ... (Code inchangé) ... */
        if (!currentQuizData) return;
        quizTitreH2.textContent = currentQuizData.titre;
        quizForm.innerHTML = '';
        currentQuizData.questions.forEach((q, index) => {
            if (!q || typeof q.question !== 'string' || !Array.isArray(q.options) || typeof q.correct !== 'number') {
                console.warn("Format question invalide:", index, q); return;
            }
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-bloc');
            questionDiv.innerHTML = `<p>${index + 1}. ${q.question}</p>`;
            const optionsList = document.createElement('div');
            optionsList.classList.add('options-container');
            q.options.forEach((option, optionIndex) => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio'; input.name = `question_${index}`; input.value = optionIndex;
                input.required = true; input.dataset.questionIndex = index;
                input.addEventListener('change', (e) => {
                    const qIndex = parseInt(e.target.dataset.questionIndex);
                    userAnswers[qIndex] = parseInt(e.target.value);
                });
                label.appendChild(input); label.appendChild(document.createTextNode(` ${option}`));
                optionsList.appendChild(label);
            });
            questionDiv.appendChild(optionsList); quizForm.appendChild(questionDiv);
        });
    }

    // --- Fonction d'affichage de la correction (GLOBALE ET UNIQUE) ---
    /**
     * Affiche les détails de la correction et met à jour le SVG du coeur proportionnellement.
     * @param {object} quizDataToDisplay - Les données complètes du quiz.
     * @param {object} answersForDisplay - Les réponses à afficher.
     * @param {number} scoreForDisplay - Le score à afficher.
     * @param {number} totalQuestions - Le nombre total de questions.
     */
    function displayCorrectionDetails(quizDataToDisplay, answersForDisplay, scoreForDisplay, totalQuestions) {
        console.log("Affichage correction/revue pour:", quizDataToDisplay?.titre);
        correctionDetailsDiv.innerHTML = ''; // Vider les anciens détails

        // Calcul du pourcentage
        const percentage = totalQuestions > 0 ? ((scoreForDisplay / totalQuestions) * 100) : 0;

        // --- *** MISE A JOUR SVG PROPORTIONNELLE AU COEUR *** ---
        const svgClipRect = document.getElementById('progress-clip-rect');
        if (svgClipRect) {
            // Définir les limites verticales *visuelles* du coeur dans le viewBox 0-100
            const HEART_TOP_Y = 15;    // Point le plus haut approximatif du coeur
            const HEART_BOTTOM_Y = 80; // Point le plus bas du coeur
            const heartVisualHeight = HEART_BOTTOM_Y - HEART_TOP_Y; // Hauteur réelle du dessin

            // Calculer la hauteur de remplissage relative à la hauteur visuelle du coeur
            let fillAmount = heartVisualHeight * (percentage / 100);
            // S'assurer que la hauteur ne dépasse pas la hauteur visuelle
            fillAmount = Math.min(fillAmount, heartVisualHeight); 
            
            // Calculer la position Y du haut du rectangle de découpe (on remplit par le bas)
            let clipY = HEART_BOTTOM_Y - fillAmount;
            // S'assurer que Y ne remonte pas au-dessus du haut du coeur
            clipY = Math.max(clipY, HEART_TOP_Y);

            console.log(`Mise à jour SVG: %=${percentage.toFixed(1)}, VisHeight=${heartVisualHeight}, FillAmount=${fillAmount.toFixed(1)}, ClipY=${clipY.toFixed(1)}`);

            // Mettre à jour les attributs du rectangle dans le clipPath
            svgClipRect.setAttribute('y', clipY);
            svgClipRect.setAttribute('height', fillAmount); // La hauteur est le montant calculé

        } else {
            console.warn("Élément SVG 'progress-clip-rect' non trouvé.");
        }
        // --- *** FIN MISE A JOUR SVG *** ---

        // Afficher le score textuel
        scoreP.textContent = `Score final : ${scoreForDisplay} / ${totalQuestions} (${percentage.toFixed(1)}%)`;

        // Afficher le détail des questions
        if (!quizDataToDisplay || !Array.isArray(quizDataToDisplay.questions)) {
            correctionDetailsDiv.innerHTML = '<p>Erreur: Impossible d\'afficher le détail des questions.</p>';
            return;
        }

        quizDataToDisplay.questions.forEach((q, index) => {
            const userAnswerIndex = answersForDisplay ? answersForDisplay[index] : undefined;
            const correctAnswerIndex = q.correct;
            const isAnswered = userAnswerIndex !== undefined && userAnswerIndex !== null;
            const isCorrect = isAnswered && userAnswerIndex === correctAnswerIndex;

            const correctionItem = document.createElement('div');
            correctionItem.classList.add('correction-item');
            if (isAnswered) correctionItem.classList.add(isCorrect ? 'correct' : 'incorrect');
            else correctionItem.classList.add('unanswered');

            let optionsHtml = q.options.map((opt, optIndex) => {
                 let style = ''; let indicator = '';
                 if (optIndex === correctAnswerIndex) { style = 'font-weight: bold;'; indicator += ' ✔️'; }
                 if (isAnswered && optIndex === userAnswerIndex) {
                     if (isCorrect) { style += ' color: var(--couleur-succes);'; indicator += ' (Votre choix)'; }
                     else { style = 'color: var(--couleur-erreur); text-decoration: line-through;'; indicator += ' ❌ (Votre choix)'; }
                 } else if (optIndex === correctAnswerIndex) { style = 'font-weight: bold;'; }
                 return `<li style="${style}">${opt}${indicator}</li>`;
            }).join('');

            correctionItem.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
                <ul>${optionsHtml}</ul>
                ${ isAnswered ? (isCorrect ? '<p style="color:var(--couleur-succes);">Correct.</p>' : `<p style="color:var(--couleur-erreur);">Incorrect.</p>`) : '<p style="color:var(--couleur-warning);">Non répondu.</p>' }
                <p class="explanation"><strong>Explication :</strong> ${q.explanation || 'N/A'}</p>
            `;
            correctionDetailsDiv.appendChild(correctionItem);
        });
    } // --- FIN de displayCorrectionDetails ---

    /**
     * Valide les réponses, calcule le score, affiche la correction et sauvegarde.
     */
    function submitQuiz() { /* ... (Code inchangé, appelle displayCorrectionDetails) ... */
        console.log("--- Fonction submitQuiz appelée ! ---");
        if (!currentQuizData) { console.error("submitQuiz sans currentQuizData."); return; }

        const totalQuestions = currentQuizData.questions.length;
        let missingCount = 0;
        for(let i = 0; i < totalQuestions; i++) { if (userAnswers[i] === undefined) missingCount++; }
        if (missingCount > 0) { alert(`Veuillez répondre aux ${missingCount} question(s) manquante(s).`); return; }

        score = 0;
        currentQuizData.questions.forEach((q, index) => { if (userAnswers[index] === q.correct) score++; });

        displayCorrectionDetails(currentQuizData, userAnswers, score, totalQuestions);
        correctionTitreH2.textContent = `Résultats : ${currentQuizData.titre}`;

        saveHistoryToServer(currentQuizData.titre, score, totalQuestions, currentQuizData.fichier, userAnswers);

        showPage('correction');
    }


    // --- Fonctions de Gestion de l'Historique (Serveur) ---
    async function saveHistoryToServer(titre, score, total, fichier, answers) { /* ... (Code inchangé) ... */
        const historyData = { titre, score, total, fichier, userAnswers: answers };
        console.log("Envoi sauvegarde historique:", historyData);
        try {
            const response = await fetch('api/save_history.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(historyData)
            });
            const resultText = await response.text();
            let result = null; try { result = JSON.parse(resultText); } catch (e) { throw new Error(`Réponse serveur invalide: ${resultText}`); }
            if (!response.ok || result.status !== 'success') throw new Error(result.message || `Erreur HTTP ${response.status}`);
            console.log('Historique sauvegardé:', result.message);
        } catch (error) {
            console.error("Erreur sauvegarde historique:", error);
        }
     }

    async function loadAndDisplayHistory() { /* ... (Code inchangé) ... */
        console.log("Chargement historique...");
        listeHistoriqueUl.innerHTML = '<li>Chargement...</li>';
        loadedHistoryData = [];
        try {
            const response = await fetch('data/history.json?nocache=' + Date.now());
            if (!response.ok) {
                if (response.status === 404) { console.log("history.json non trouvé."); loadedHistoryData = []; }
                else throw new Error(`HTTP ${response.status}`);
            } else {
                const historyJson = await response.json();
                if (!Array.isArray(historyJson)) throw new Error("Format history.json invalide.");
                loadedHistoryData = historyJson;
            }
            console.log("Historique chargé:", loadedHistoryData);
            displayHistory(loadedHistoryData);
        } catch (error) {
            console.error("Erreur chargement historique:", error);
            listeHistoriqueUl.innerHTML = `<li>Erreur chargement historique (${error.message}).</li>`;
        }
    }

    function displayHistory(history) { /* ... (Code inchangé) ... */
        listeHistoriqueUl.innerHTML = '';
        if (btnEffacerHistorique) {
             btnEffacerHistorique.style.display = (!history || history.length === 0) ? 'none' : 'inline-block';
        }
        if (!history || history.length === 0) {
            listeHistoriqueUl.innerHTML = '<li>Aucun historique disponible.</li>'; return;
        }
        console.log(`Affichage ${history.length} entrées historique.`);
        history.slice().reverse().forEach((entry, index) => {
            const originalIndex = history.length - 1 - index;
            if (!entry || !entry.titre || !entry.date || typeof entry.score !== 'number' || typeof entry.total !== 'number' || !entry.fichier || typeof entry.userAnswers !== 'object') {
                 console.warn("Entrée historique invalide:", originalIndex, entry); return;
            }
            const li = document.createElement('li');
            li.id = `history-item-${originalIndex}`;
            li.innerHTML = `<span><strong>${entry.titre}</strong> - Score: ${entry.score}/${entry.total} (${entry.percentage}%) - ${entry.date}</span> <button class="btn-review" data-history-index="${originalIndex}">Revoir</button>`;
            const reviewButton = li.querySelector('.btn-review');
            if (reviewButton) reviewButton.addEventListener('click', (e) => { e.stopPropagation(); reviewAttempt(originalIndex); });
            listeHistoriqueUl.appendChild(li);
        });
    }

    async function reviewAttempt(historyIndex) { /* ... (Code inchangé) ... */
        console.log(`Revue historique index: ${historyIndex}`);
        if (!loadedHistoryData || historyIndex < 0 || historyIndex >= loadedHistoryData.length) { alert("Index historique invalide."); return; }
        const attemptData = loadedHistoryData[historyIndex];
        if (!attemptData || !attemptData.fichier || typeof attemptData.userAnswers !== 'object') { alert("Données tentative invalides."); return; }
        console.log("Données tentative:", attemptData);
        try {
            currentQuizData = null;
            const response = await fetch(`data/${attemptData.fichier}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            currentQuizData = await response.json();
            if (!currentQuizData || !currentQuizData.titre || !Array.isArray(currentQuizData.questions)) throw new Error("Format JSON quiz invalide.");
            currentQuizData.fichier = attemptData.fichier;
            console.log("Quiz associé chargé:", currentQuizData.titre);
            displayCorrectionDetails(currentQuizData, attemptData.userAnswers, attemptData.score, attemptData.total);
            correctionTitreH2.textContent = `Revue : ${attemptData.titre} (du ${attemptData.date})`;
            showPage('correction');
        } catch (error) {
            console.error("Erreur revue tentative:", error);
            alert(`Erreur lors de la revue (${error.message}).`);
            showPage('historique');
        }
    }

    async function clearHistoryOnServer() { /* ... (Code inchangé) ... */
        if (!confirm("Effacer définitivement tout l'historique ?")) return;
        console.log("Tentative effacement historique serveur...");
        try {
            const response = await fetch('api/clear_history.php', { method: 'POST' });
            const resultText = await response.text();
            let result = null; try { result = JSON.parse(resultText); } catch (e) { throw new Error(`Réponse serveur invalide: ${resultText}`); }
            if (!response.ok || result.status !== 'success') throw new Error(result.message || `Erreur HTTP ${response.status}`);
            console.log('Historique effacé:', result.message);
            loadedHistoryData = [];
            displayHistory(loadedHistoryData);
            alert("L'historique a été effacé.");
        } catch (error) {
            console.error("Erreur effacement historique:", error);
            alert(`Erreur lors de l'effacement (${error.message}).`);
        }
     }


    // --- Écouteurs d'Événements ---

    // Navigation principale
    if(btnAccueil) btnAccueil.addEventListener('click', () => { currentQuizData = null; showPage('accueil'); });
    if(btnHistorique) btnHistorique.addEventListener('click', () => { currentQuizData = null; loadAndDisplayHistory(); showPage('historique'); });

    // Retours vers l'accueil
    if(btnRetourAccueilCorrection) btnRetourAccueilCorrection.addEventListener('click', () => { currentQuizData = null; showPage('accueil'); });
    if(btnRetourAccueilHistorique) btnRetourAccueilHistorique.addEventListener('click', () => { currentQuizData = null; showPage('accueil'); });

    // --- *** CORRIGÉ : Utiliser l'événement CLICK du bouton (car il est hors formulaire) *** ---
    if (btnValiderQuiz) {
        btnValiderQuiz.addEventListener('click', (event) => {
            // event.preventDefault(); // Pas strictement nécessaire pour un bouton type="button"
            console.log("Bouton Valider cliqué (hors formulaire)");
            submitQuiz(); // Appelle directement la fonction de traitement
        });
    } else {
        console.error("Le bouton #btn-valider-quiz est introuvable ! Vérifiez l'ID dans index.html");
    }

    // Commenter ou supprimer l'écouteur submit sur le formulaire, car le bouton est externe
    /*
    quizForm.addEventListener('submit', (event) => {
         event.preventDefault();
         console.log("Événement submit capturé sur quizForm (NON UTILISÉ)");
         submitQuiz();
    });
    */

    // Effacement de l'historique
    if (btnEffacerHistorique) {
        btnEffacerHistorique.addEventListener('click', clearHistoryOnServer);
        btnEffacerHistorique.style.display = 'none';
    }

    // --- Initialisation ---
    console.log("Configuration écouteurs terminée. Lancement initial...");
    loadQuizIndex();
    showPage('accueil');

}); // Fin de DOMContentLoaded

console.log("Script app.js chargé.");
// ==========================================================================