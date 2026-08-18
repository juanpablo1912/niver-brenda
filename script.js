const screens = {
    transmission: document.getElementById('screen-transmission'),
    dialogue: document.getElementById('screen-dialogue'),
    reveal: document.getElementById('screen-reveal'),
    minigame: document.getElementById('screen-minigame'),
    proposal: document.getElementById('screen-proposal'),
    success: document.getElementById('screen-success')
};

const btnStart = document.getElementById('btn-start');
const dialogueBox = document.getElementById('dialogue-box-text');
const terminalClickArea = document.getElementById('terminal-click-area');

const containerRick = document.getElementById('container-rick');
const containerMorty = document.getElementById('container-morty');
const badgeRick = document.getElementById('badge-rick');
const badgeMorty = document.getElementById('badge-morty');
const rickImg = document.getElementById('rick-img');
const mortyImg = document.getElementById('morty-img');

const bgMusic = document.getElementById('bg-music');
const rickAudio = document.getElementById('rick-audio');
const mortyAudio = document.getElementById('morty-audio');
const thinkingMusic = document.getElementById('thinking-music');

// Áudio, Imagem e Texto do Rick na tela de sucesso
const rickParabensAudio = document.getElementById('rick-parabens-audio');
const rickSuccessImg = document.getElementById('rick-success-img');
const successTextElement = document.getElementById('success-text');

const btnEnterDimension = document.getElementById('btn-enter-dimension');
const portalTrigger = document.getElementById('portal-trigger');
const letterTextView = document.getElementById('letter-text');
const proposalActions = document.getElementById('proposal-actions');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');

function switchScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenKey].classList.add('active');
}

// Diálogo com as falas completas
const dialogueSteps = [
    {
        speaker: 'rick',
        text: "Ugh... Morty, você tem noção do absurdo que é isso? Você me arrastou por dimensões infinitas, pulando portais cheios de gosma radioativa, só para eu parar e olhar para uma tela de computador? Olha, eu tenho ciência interdimensional pra gerenciar, mas... tem certas anomalias que nem a minha cabeça consegue ignorar. Tipo o fato de que, em todas as 8 bilhões de realidades paralelas, essa tal de Brenda é simplesmente fora de série.",
        containerActive: containerRick, containerDim: containerMorty,
        badgeActive: badgeRick, badgeDim: badgeMorty,
        audio: rickAudio,
        imgActive: rickImg, activeName: 'rick'
    },
    {
        speaker: 'morty',
        text: "É, Rick! É exatamente isso que eu tô tentando te dizer, caramba! Porque ela é muito incrível, sério! Tipo, em todas as realidades que a gente visitou, não tem nenhuma versão dela que não seja perfeita, inteligente e maravilhosa. E o Juan... nossa, o Juan tá completamente pirado por você, Brenda! O maluco passa o dia inteiro pensando em você em todas as dimensões, não consegue disfarçar nada, então... poxa, aceita logo o pedido do cara!",
        containerActive: containerMorty, containerDim: containerRick,
        badgeActive: badgeMorty, badgeDim: badgeRick,
        audio: mortyAudio,
        imgActive: mortyImg, activeName: 'morty'
    }
];

let currentStep = 0;
let typingTimeout = null;
let animationIntervals = {};

function setupAudioSync(audioElement, imgElement, characterName) {
    if (animationIntervals[characterName]) {
        clearInterval(animationIntervals[characterName]);
    }

    audioElement.currentTime = 0;
    audioElement.play().catch(err => console.log("Áudio de voz falhou:", err));

    let isOpen = false;
    
    animationIntervals[characterName] = setInterval(() => {
        if (audioElement.paused || audioElement.ended) {
            imgElement.src = `assets/img/${characterName}_fechada.png`;
            clearInterval(animationIntervals[characterName]);
            return;
        }
        
        isOpen = !isOpen;
        imgElement.src = `assets/img/${characterName}_${isOpen ? 'aberta' : 'fechada'}.png`;
    }, 130);

    audioElement.onended = () => {
        imgElement.src = `assets/img/${characterName}_fechada.png`;
        clearInterval(animationIntervals[characterName]);
    };
}

btnStart.addEventListener('click', async () => {
    switchScreen('dialogue');
    try {
        bgMusic.volume = 0.12;
        await bgMusic.play();
    } catch (e) {
        console.log("Áudio de fundo restrito:", e);
    }
    playDialogueStep();
});

function playDialogueStep() {
    if (currentStep >= dialogueSteps.length) {
        switchScreen('reveal');
        return;
    }

    const step = dialogueSteps[currentStep];
    
    step.containerActive.classList.remove('dimmed');
    step.containerActive.classList.add('highlighted');
    step.badgeActive.classList.add('active');

    step.containerDim.classList.remove('highlighted');
    step.containerDim.classList.add('dimmed');
    step.badgeDim.classList.remove('active');

    clearTimeout(typingTimeout);
    dialogueBox.innerHTML = "";

    if (step.audio) {
        setupAudioSync(step.audio, step.imgActive, step.activeName);
    }

    let charIndex = 0;
    const fullText = step.text;
    
    function typeWriter() {
        if (charIndex < fullText.length) {
            dialogueBox.innerHTML += fullText.charAt(charIndex);
            charIndex++;
            typingTimeout = setTimeout(typeWriter, 22);
        }
    }
    typeWriter();
}

terminalClickArea.addEventListener('click', () => {
    rickAudio.pause();
    mortyAudio.pause();
    if (animationIntervals['rick']) clearInterval(animationIntervals['rick']);
    if (animationIntervals['morty']) clearInterval(animationIntervals['morty']);
    
    clearTimeout(typingTimeout);
    rickImg.src = "assets/img/rick_fechada.png";
    mortyImg.src = "assets/img/morty_fechada.png";

    currentStep++;
    playDialogueStep();
});

// --- FLUXO DO MINIGAME ESTILO WHACK-A-MOLE ---
const triggerMinigame = () => {
    rickAudio.pause();
    mortyAudio.pause();
    if (animationIntervals['rick']) clearInterval(animationIntervals['rick']);
    if (animationIntervals['morty']) clearInterval(animationIntervals['morty']);
    
    switchScreen('minigame');
    startAlienMinigame();
};

btnEnterDimension.addEventListener('click', triggerMinigame);
portalTrigger.addEventListener('click', triggerMinigame);

let aliensDefeated = 0;
const alienScoreEl = document.getElementById('alien-score');
const holes = document.querySelectorAll('.alien-hole');
let lastHole = null;
let alienTimer = null;
let gameIsActive = false;

function startAlienMinigame() {
    aliensDefeated = 0;
    alienScoreEl.textContent = aliensDefeated;
    gameIsActive = true;

    // Limpa todos os buracos antes de começar
    holes.forEach(hole => {
        hole.innerHTML = '';
        hole.classList.remove('up');
    });

    // Cria o elemento do alien em cada buraco
    holes.forEach((hole, index) => {
        hole.innerHTML = '<div class="mole-alien">👾</div>';
        const alienEl = hole.querySelector('.mole-alien');
        
        // Evento de clique para acertar o alien
        alienEl.onclick = () => {
            if (!gameIsActive) return;
            if (hole.classList.contains('up')) {
                aliensDefeated++;
                alienScoreEl.textContent = aliensDefeated;
                hole.classList.remove('up');
                
                if (aliensDefeated >= 3) {
                    gameIsActive = false;
                    clearTimeout(alienTimer);
                    // Passa para a carta romântica após vencer
                    setTimeout(() => {
                        switchScreen('proposal');
                        startHeartfeltLetter();
                    }, 600);
                }
            }
        };
    });

    showRandomAlien();
}

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) {
        return randomHole(holes);
    }
    lastHole = hole;
    return hole;
}

function showRandomAlien() {
    if (!gameIsActive) return;

    const time = randomTime(700, 1200); // Tempo que o alien fica visível (quanto menor, mais difícil)
    const hole = randomHole(holes);

    hole.classList.add('up');

    alienTimer = setTimeout(() => {
        hole.classList.remove('up');
        if (gameIsActive) {
            showRandomAlien();
        }
    }, time);
}

// --- CARTA ROMÂNTICA COM MÚSICA THINKING OUT LOUD ---
function startHeartfeltLetter() {
    // Abaixa a música de fundo anterior e toca a romântica
    bgMusic.pause();
    try {
        thinkingMusic.volume = 0.3;
        thinkingMusic.play();
    } catch (e) {
        console.log("Áudio romântico restrito:", e);
    }

    const heartfeltMessage = 
`Brenda,

Desde que eu te conheci, fiquei feliz demais por ter encontrado alguém como você, que tem praticamente a mesma sintonia que eu. Apesar do nosso humor duvidoso ksksksksks, aos poucos eu percebi, no fundo do meu coração, que realmente quero estar com você.

Você é uma pessoa incrível de verdade, seja nos nossos sorrisos, quando a gente joga, conversa, ou até naquela primeira vez que ficamos ouvindo música juntos. Tudo isso pode parecer simples, mas, para mim, são momentos inesquecíveis que eu guardo com muito carinho.

No fim de tudo, sei que o que sinto por você é muito verdadeiro. Quero estar do seu lado tanto nos momentos difíceis quanto nos mais felizes.

Então, dito isso... quer namorar comigo? ❤️`;

    let charIdx = 0;
    letterTextView.innerHTML = "";

    function typeLetter() {
        if (charIdx < heartfeltMessage.length) {
            letterTextView.innerHTML += heartfeltMessage.charAt(charIdx);
            charIdx++;
            setTimeout(typeLetter, 26);
        } else {
            proposalActions.style.display = 'flex';
        }
    }
    typeLetter();
}

const moveFujaoButton = () => {
    const randomX = (Math.random() - 0.5) * 280;
    const randomY = (Math.random() - 0.5) * 150;
    btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
};

btnNo.addEventListener('mouseover', moveFujaoButton);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveFujaoButton();
});
btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    moveFujaoButton();
});

const successMessage = 
`Olha, Brenda... eu não faço festinha de aniversário e odeio discursos piegas. Mas o Juan passou dias inteiros me enchendo o saco com essa historinha de 21 anos e só pra garantir que essa palhaçada romântica ficasse pronta. Então... parabéns, ou sei lá o que. Agora você tá oficialmente autorizada a tomar decisões duvidosas em qualquer linha temporal e a continuar aguentando as maluquices dele. Wubba lubba dub dub, agora fecha essa aba antes que eu exploda o servidor!`;

btnYes.addEventListener('click', () => {
    // Para a música romântica ao aceitar
    thinkingMusic.pause();

    // 1. Muda para a tela de sucesso
    switchScreen('success');

    // 2. Para áudios anteriores
    rickAudio.pause();
    mortyAudio.pause();

    // 3. Toca o áudio de parabéns e ativa a animação da boca do Rick
    if (rickParabensAudio && rickSuccessImg) {
        setupAudioSync(rickParabensAudio, rickSuccessImg, 'rick');
    }

    // 4. Solta os confetes
    confetti({
        particleCount: 400,
        spread: 180,
        origin: { y: 0.6 },
        colors: ['#00FF66', '#FF3B81', '#39D9FF', '#FFFFFF', '#F59E0B']
    });

    // 5. Faz o texto aparecer digitando aos poucos junto com a fala
    if (successTextElement) {
        successTextElement.innerHTML = "";
        let charIndex = 0;

        function typeSuccessText() {
            if (charIndex < successMessage.length) {
                successTextElement.innerHTML += successMessage.charAt(charIndex);
                charIndex++;
                setTimeout(typeSuccessText, 25);
            }
        }
        typeSuccessText();
    }
});
// --- INTERATIVIDADE DO BOLO DE ANIVERSÁRIO ---
const birthdayCake = document.getElementById('birthday-cake');
const cakeEmoji = document.getElementById('cake-emoji');
let candlesBlown = false;

if (birthdayCake) {
    birthdayCake.addEventListener('click', () => {
        if (!candlesBlown) {
            candlesBlown = true;
            cakeEmoji.textContent = '🎂✨'; // Apaga a chama e coloca brilho
            birthdayCake.querySelector('p').textContent = 'Velas sopradas! Desejo interdimensional realizado! 🌠';
            
            // Efeito de zoom rápido no bolo
            cakeEmoji.style.transform = 'scale(1.2)';
            setTimeout(() => { cakeEmoji.style.transform = 'scale(1)'; }, 200);

            // Solta confetes extras para celebrar o sopro das velas
            confetti({
                particleCount: 150,
                spread: 120,
                origin: { y: 0.6 },
                colors: ['#00FF66', '#FF3B81', '#39D9FF', '#F59E0B', '#FFFFFF']
            });
        }
    });
}