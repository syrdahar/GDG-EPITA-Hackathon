/**
 * Mode démo : produit un jeu d'exemple cohérent quand aucune clé Gemini
 * n'est configurée, pour que toute la chaîne (upload -> jeu -> partage) tourne.
 */

export function mockKnowledge() {
  return {
    detected_subject: "Réseaux informatiques",
    detected_level: "lycée / début licence",
    summary:
      "Introduction aux réseaux : modèle OSI, adressage IP, protocoles TCP/UDP et notions de sécurité de base.",
    concepts: [
      { name: "Modèle OSI", description: "Découpe les communications réseau en 7 couches." },
      { name: "Adresse IP", description: "Identifiant numérique unique d'une machine sur un réseau." },
      { name: "TCP vs UDP", description: "TCP est fiable et orienté connexion ; UDP est rapide sans garantie." },
      { name: "Pare-feu", description: "Filtre le trafic réseau selon des règles de sécurité." },
    ],
    definitions: [
      { term: "Protocole", definition: "Ensemble de règles régissant l'échange de données." },
      { term: "Port", definition: "Numéro identifiant un service sur une machine (ex: 80 pour HTTP)." },
    ],
    formulas: [],
    important_facts: [
      "Le modèle OSI comporte 7 couches.",
      "HTTP utilise le port 80, HTTPS le port 443.",
      "TCP garantit l'ordre et la livraison des paquets.",
    ],
    learning_objectives: [
      "L'élève sera capable d'expliquer le rôle des couches du modèle OSI.",
      "L'élève sera capable de distinguer TCP et UDP.",
      "L'élève sera capable d'identifier les ports des services courants.",
    ],
  };
}

export function mockStory(knowledge) {
  return {
    title: "Cyber Cité : la traque du Paquet Fantôme",
    universe:
      "Une mégapole numérique où les données circulent comme des citoyens. Un mystérieux pirate, le Paquet Fantôme, sème le chaos dans le réseau de la ville.",
    tone: "cyberpunk, mystérieux",
    hero: {
      name: "Nova",
      description: "Jeune analyste réseau recrutée par la Cyber Police pour traquer le Paquet Fantôme.",
    },
    characters: [
      { name: "ARIA", role: "mentor (IA)", description: "Intelligence artificielle guide de Nova." },
      { name: "Le Paquet Fantôme", role: "antagoniste", description: "Pirate insaisissable qui exploite les failles du réseau." },
    ],
    story_arc:
      "Nova explore les couches de la Cyber Cité, déjoue les pièges du Paquet Fantôme et restaure la sécurité du réseau couche après couche.",
    chapters: [
      { title: "Les 7 portes (OSI)", summary: "Nova découvre l'architecture en couches de la ville.", concepts_covered: ["Modèle OSI"] },
      { title: "L'adresse perdue", summary: "Retrouver une machine grâce à son IP.", concepts_covered: ["Adresse IP", "Port"] },
      { title: "Course contre la montre", summary: "Choisir le bon protocole pour transmettre une alerte.", concepts_covered: ["TCP vs UDP"] },
      { title: "Le dernier rempart", summary: "Configurer le pare-feu pour piéger le pirate.", concepts_covered: ["Pare-feu"] },
    ],
  };
}

export function mockGame(knowledge, story) {
  return {
    title: story.title,
    universe: story.universe,
    story: "Bienvenue dans la Cyber Cité, Nova. Le Paquet Fantôme a infiltré le réseau. À toi de jouer.",
    difficulty: "moyen",
    levels: [
      {
        chapter: "Les 7 portes (OSI)",
        scene_description: "Hall d'entrée néon de la Cyber Cité, sept grandes portes lumineuses alignées, ambiance bleu électrique.",
        narrative: "ARIA : « Chaque porte est une couche du réseau. Pour avancer, prouve que tu connais leur nombre. »",
        concept: "Modèle OSI",
        question: "Combien de couches comporte le modèle OSI ?",
        choices: { A: "4", B: "5", C: "7", D: "9" },
        correct_answer: "C",
        explanation: "Le modèle OSI est composé de 7 couches, de la couche physique à la couche application.",
      },
      {
        chapter: "L'adresse perdue",
        scene_description: "Ruelle numérique pluvieuse, panneaux holographiques affichant des suites de chiffres.",
        narrative: "ARIA : « Une machine se cache ici. Son identité ? Son adresse. »",
        concept: "Adresse IP",
        question: "À quoi sert une adresse IP ?",
        choices: {
          A: "À chiffrer les données",
          B: "À identifier une machine sur le réseau",
          C: "À accélérer la connexion",
          D: "À stocker des fichiers",
        },
        correct_answer: "B",
        explanation: "Une adresse IP identifie de manière unique une machine sur un réseau.",
      },
      {
        chapter: "L'adresse perdue",
        scene_description: "Salle des serveurs, racks clignotants, étiquettes de ports numérotés.",
        narrative: "ARIA : « Le service web est compromis. Quel port surveiller ? »",
        concept: "Port",
        question: "Quel port est utilisé par défaut pour HTTPS ?",
        choices: { A: "21", B: "80", C: "443", D: "25" },
        correct_answer: "C",
        explanation: "HTTPS utilise le port 443 ; HTTP utilise le port 80.",
      },
      {
        chapter: "Course contre la montre",
        scene_description: "Autoroute de données en mouvement rapide, traînées lumineuses, urgence orange.",
        narrative: "Nova doit envoyer une alerte vidéo en direct, le temps presse.",
        concept: "TCP vs UDP",
        question: "Pour un flux vidéo en direct où la rapidité prime sur la fiabilité, quel protocole choisir ?",
        choices: { A: "TCP", B: "UDP", C: "HTTP", D: "FTP" },
        correct_answer: "B",
        explanation: "UDP est privilégié pour le streaming en direct car il est rapide, même s'il ne garantit pas la livraison.",
      },
      {
        chapter: "Le dernier rempart",
        scene_description: "Mur de lumière rouge protégeant le cœur du réseau, interface de règles de filtrage.",
        narrative: "ARIA : « Dernière étape. Active la bonne défense pour piéger le Paquet Fantôme. »",
        concept: "Pare-feu",
        question: "Quel est le rôle principal d'un pare-feu ?",
        choices: {
          A: "Augmenter le débit",
          B: "Filtrer le trafic réseau selon des règles",
          C: "Compresser les fichiers",
          D: "Attribuer les adresses IP",
        },
        correct_answer: "B",
        explanation: "Un pare-feu filtre le trafic entrant et sortant selon des règles de sécurité définies.",
      },
    ],
  };
}

export function mockEdit(game, command) {
  return {
    message: `(Mode démo) Commande reçue : « ${command} ». Configure une clé GEMINI_API_KEY pour activer l'édition réelle par l'IA.`,
    game,
  };
}
