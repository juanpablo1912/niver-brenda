const screens = {
    transmission: document.getElementById('screen-transmission'),
    dialogue: document.getElementById('screen-dialogue'),
    reveal: document.getElementById('screen-reveal'),
    minigame: document.getElementById('screen-minigame'),
    proposal: document.getElementById('screen-proposal'),
    success: document.getElementById('screen-success'),
    memories: document.getElementById('screen-memories')
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
const openingAudio = document.getElementById('opening-audio');

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
const audioToggle = document.getElementById('audio-toggle');
const btnReplay = document.getElementById('btn-replay');
const btnMemories = document.getElementById('btn-memories');
const btnBackSuccess = document.getElementById('btn-back-success');
const successActions = document.getElementById('success-actions');
const memoriesGrid = document.getElementById('memories-grid');
const surpriseTrigger = document.getElementById('surprise-trigger');
const surprisePanel = document.getElementById('surprise-panel');
const surpriseText = document.getElementById('surprise-text');
const surpriseClose = document.getElementById('surprise-close');
const aiDentoMeme = document.getElementById('ai-dento-meme');
const multiverseIntro = document.getElementById('multiverse-intro');
const skipIntro = document.getElementById('skip-intro');

const allAudio = [bgMusic, rickAudio, mortyAudio, thinkingMusic, rickParabensAudio, openingAudio].filter(Boolean);
let audioMuted = false;
let letterTimeout = null;
let successTimeout = null;
let memoryCardsOpened = new Set();
let introTimeout = null;
let warpAudioContext = null;

if (aiDentoMeme) {
    aiDentoMeme.addEventListener('error', () => aiDentoMeme.remove());
}

async function playWarpSound() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        warpAudioContext ||= new AudioContextClass();
        const context = warpAudioContext;
        if (context.state === 'suspended') {
            await context.resume();
        }

        const now = context.currentTime;
        const master = context.createGain();
        master.gain.setValueAtTime(0.0001, now);
        master.gain.exponentialRampToValueAtTime(0.24, now + 0.08);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
        master.connect(context.destination);

        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(110, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.72);
        oscillator.frequency.exponentialRampToValueAtTime(220, now + 1.15);
        oscillator.connect(master);
        oscillator.start(now);
        oscillator.stop(now + 1.2);
    } catch (error) {
        // O efeito visual continua normalmente se o áudio estiver indisponível.
    }
}

function playOpeningAudio() {
    if (!openingAudio || audioMuted) return;
    openingAudio.currentTime = 0;
    openingAudio.volume = 0.55;
    openingAudio.play().catch(() => {
        playWarpSound();
    });
}

function leaveMultiverseIntro() {
    if (!multiverseIntro || multiverseIntro.classList.contains('is-leaving')) return;
    clearTimeout(introTimeout);
    playOpeningAudio();
    multiverseIntro.classList.add('is-leaving');
    window.setTimeout(() => {
        openingAudio?.pause();
        if (openingAudio) openingAudio.currentTime = 0;
        multiverseIntro.remove();
    }, 950);
}

if (multiverseIntro) {
    playOpeningAudio();
    introTimeout = window.setTimeout(leaveMultiverseIntro, 9200);
    skipIntro.addEventListener('click', leaveMultiverseIntro);
}

function naturalTyping(element, text, onComplete, speed = 34) {
    let tokenIndex = 0;
    const tokens = text.match(/\s+|[^\s]+/g) || [];

    element.textContent = '';

    function revealNextToken() {
        if (tokenIndex >= tokens.length) {
            if (onComplete) onComplete();
            return;
        }

        const token = tokens[tokenIndex++];
        element.textContent += token;
        const punctuation = /[.!?…:]$/.test(token);
        const comma = /[,;]$/.test(token);
        const lineBreak = token.includes('\n');
        const pause = punctuation ? speed * 8 : comma ? speed * 4 : lineBreak ? speed * 5 : speed + Math.random() * speed;
        typingTimeout = setTimeout(revealNextToken, pause);
    }

    revealNextToken();
}

function naturalTypingWithTimer(element, text, onComplete, speed = 36) {
    let tokenIndex = 0;
    const tokens = text.match(/\s+|[^\s]+/g) || [];
    element.textContent = '';

    function revealNextToken() {
        if (tokenIndex >= tokens.length) {
            if (onComplete) onComplete();
            return;
        }
        const token = tokens[tokenIndex++];
        element.textContent += token;
        const pause = /[.!?…:]$/.test(token) ? speed * 7 : /[,;]$/.test(token) ? speed * 3 : speed + Math.random() * speed;
        letterTimeout = setTimeout(revealNextToken, pause);
    }
    revealNextToken();
}

function safePlay(audioElement) {
    if (!audioElement || audioMuted) return;
    audioElement.play().catch(() => {
        audioToggle.textContent = '🔇';
    });
}

function stopAllAudio() {
    allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    Object.keys(animationIntervals).forEach(characterName => {
        clearInterval(animationIntervals[characterName]);
    });
    animationIntervals = {};
    rickImg.src = 'assets/img/rick_fechada.png';
    mortyImg.src = 'assets/img/morty_fechada.png';
    if (rickSuccessImg) rickSuccessImg.src = 'assets/img/rick_fechada.png';
}

function resetExperience() {
    clearTimeout(typingTimeout);
    clearTimeout(letterTimeout);
    clearTimeout(successTimeout);
    clearTimeout(alienTimer);
    typingTimeout = null;
    letterTimeout = null;
    successTimeout = null;
    gameIsActive = false;
    lastHole = null;
    aliensDefeated = 0;
    candlesBlown = false;
    memoryCardsOpened = new Set();
    stopAllAudio();
    dialogueBox.textContent = 'Aguardando sincronização...';
    letterTextView.textContent = '';
    successTextElement.textContent = '';
    successActions.hidden = true;
    proposalActions.style.display = 'none';
    btnNo.style.transform = '';
    cakeEmoji.textContent = '🎂🔥';
    cakeEmoji.style.transform = 'scale(1)';
    birthdayCake.querySelector('p').textContent = '(Clique no bolo para soprar as velas!)';
    surprisePanel.hidden = true;
    surpriseTrigger.disabled = true;
    holes.forEach(hole => {
        hole.classList.remove('up');
        hole.innerHTML = '';
    });
    currentStep = 0;
    switchScreen('transmission');
}

audioToggle.addEventListener('click', () => {
    audioMuted = !audioMuted;
    if (audioMuted) {
        allAudio.forEach(audio => audio.pause());
        audioToggle.textContent = '🔇';
        audioToggle.setAttribute('aria-label', 'Ativar áudio');
    } else {
        audioToggle.textContent = '🔊';
        audioToggle.setAttribute('aria-label', 'Pausar áudio');
        const activeAudio = allAudio.find(audio => !audio.paused);
        if (!activeAudio && multiverseIntro && !multiverseIntro.classList.contains('is-leaving')) {
            playOpeningAudio();
        } else if (!activeAudio && screens.dialogue.classList.contains('active')) {
            safePlay(bgMusic);
        }
    }
    audioToggle.setAttribute('aria-pressed', String(audioMuted));
});

function switchScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.remove('active', 'screen-entering'));
    if (screens[screenKey]) {
        screens[screenKey].scrollTop = 0;
        screens[screenKey].classList.add('active');
        requestAnimationFrame(() => screens[screenKey].classList.add('screen-entering'));
        window.setTimeout(() => screens[screenKey].classList.remove('screen-entering'), 700);
    }
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
    safePlay(audioElement);

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
    playOpeningAudio();
    resetExperience();
    switchScreen('dialogue');
    bgMusic.volume = 0.12;
    safePlay(bgMusic);
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
    dialogueBox.textContent = "";

    if (step.audio) {
        setupAudioSync(step.audio, step.imgActive, step.activeName);
    }

    const fullText = step.text;
    naturalTyping(dialogueBox, fullText, null, 28);
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
        safePlay(thinkingMusic);
    } catch (e) {
        console.log("Áudio romântico restrito:", e);
    }

    const heartfeltMessage = 
`Brenda,

Desde que eu te conheci, fiquei feliz demais por ter encontrado alguém como você, que tem praticamente a mesma sintonia que eu. Apesar do nosso humor duvidoso ksksksksks, aos poucos eu percebi, no fundo do meu coração, que realmente quero estar com você.

Você é uma pessoa incrível de verdade, seja nos nossos sorrisos, quando a gente joga, conversa, ou até naquela primeira vez que ficamos ouvindo música juntos. Tudo isso pode parecer simples, mas, para mim, são momentos inesquecíveis que eu guardo com muito carinho.

No fim de tudo, sei que o que sinto por você é muito verdadeiro. Quero estar do seu lado tanto nos momentos difíceis quanto nos mais felizes.

Então, dito isso... quer namorar comigo? ❤️`;

    letterTextView.textContent = "";
    naturalTypingWithTimer(letterTextView, heartfeltMessage, () => {
        proposalActions.style.display = 'flex';
    }, 30);
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

const memories = [
    { title: 'SINTONIA', text: 'Aquela sensação boa de encontrar alguém que entende o seu humor e a sua energia.' },
    { title: 'PRIMEIRA TRILHA', text: 'Uma música compartilhada pode parecer simples, mas algumas ficam guardadas para sempre.' },
    { title: 'NOSSO UNIVERSO', text: 'Entre jogos, conversas e risadas, cada momento com você virou uma dimensão favorita.' }
];

function renderMemories() {
    memoriesGrid.innerHTML = '';
    memories.forEach((memory, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'memory-card';
        card.dataset.memoryIndex = String(index);
        card.innerHTML = `<strong>${memory.title}</strong><span>${memory.text}</span>`;
        card.addEventListener('click', () => {
            memoryCardsOpened.add(index);
            card.classList.add('opened');
            card.setAttribute('aria-label', `${memory.title}: ${memory.text}`);
            if (memoryCardsOpened.size === memories.length) {
                surpriseTrigger.disabled = false;
                surpriseTrigger.textContent = '✨ Abrir Modo Surpresa';
            }
        });
        memoriesGrid.appendChild(card);
    });
}

renderMemories();

btnMemories.addEventListener('click', () => {
    switchScreen('memories');
    memoriesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

btnBackSuccess.addEventListener('click', () => {
    surprisePanel.hidden = true;
    switchScreen('success');
});

surpriseTrigger.addEventListener('click', () => {
    if (surpriseTrigger.disabled) return;
    stopAllAudio();
    surpriseText.textContent = 'Brenda, entre todas as dimensões possíveis, eu escolheria encontrar você em cada uma delas. Esta é a minha surpresa: obrigado por transformar os dias comuns nos meus favoritos. Eu te amo. ❤️';
    surprisePanel.hidden = false;
    surprisePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

surpriseClose.addEventListener('click', () => {
    rickParabensAudio.pause();
    surprisePanel.hidden = true;
});

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
        clearTimeout(successTimeout);
        let tokenIndex = 0;
        const tokens = successMessage.match(/\s+|[^\s]+/g) || [];
        successTextElement.textContent = '';

        function typeSuccessText() {
            if (tokenIndex >= tokens.length) {
                successActions.hidden = false;
                return;
            }
            const token = tokens[tokenIndex++];
            successTextElement.textContent += token;
            const pause = /[.!?…:]$/.test(token) ? 180 : /[,;]$/.test(token) ? 90 : 28 + Math.random() * 22;
            successTimeout = setTimeout(typeSuccessText, pause);
        }
        typeSuccessText();
    }
});

btnReplay.addEventListener('click', resetExperience);
// --- INTERATIVIDADE DO BOLO DE ANIVERSÁRIO ---
const birthdayCake = document.getElementById('birthday-cake');
const cakeEmoji = document.getElementById('cake-emoji');
let candlesBlown = false;

if (birthdayCake) {
    const blowCandles = () => {
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
    };

    birthdayCake.addEventListener('click', blowCandles);
    birthdayCake.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            blowCandles();
        }
    });
}