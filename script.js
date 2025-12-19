let currentLevel = "";
let questionsList = [];
let index = 0;
let correct = 0;
let isMuted = false;
let timer;
let timeLeft = 20;

// Load sound elements
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const tickSound = document.getElementById('tick-sound');
const levelupSound = document.getElementById('levelup-sound');

document.addEventListener("DOMContentLoaded", function() {
    showLevels();
    setupThemeToggle();
    applySavedTheme();
    setupMuteToggle();
    loadMuteSetting();
});

function showLevels() {
    const levelDiv = document.getElementById('levels');
    levelDiv.innerHTML = '';

    let levels = Object.keys(questions);

    levels.forEach((level, i) => {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.innerText = i + 1;

        if (!isLevelUnlocked(i + 1)) {
            button.disabled = true;
            const lock = document.createElement('span');
            lock.className = 'lock-icon';
            lock.innerText = '🔒';
            button.appendChild(lock);
        }

        button.onclick = () => startLevel(level);
        levelDiv.appendChild(button);
    });
}

function isLevelUnlocked(levelNumber) {
    return localStorage.getItem(`NGSL-level${levelNumber}`) === 'passed' || levelNumber === 1;
}

function startLevel(levelName) {
    currentLevel = levelName;
    let allQuestions = questions[levelName];

    questionsList = shuffleArray(allQuestions).slice(0, 20);

    index = 0;
    correct = 0;
    document.getElementById('level-select').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('page-title').style.display = 'none';
    showQuestion();
}

function showQuestion() {
    if (index >= questionsList.length) {
        finishQuiz();
        return;
    }
    const q = questionsList[index];
    document.getElementById('question-number').innerText = `${index + 1} - ${questionsList.length}`;
    document.getElementById('question-text').innerText = q.Question;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    [...q.options, q.RightAnswer].sort(() => Math.random() - 0.5).forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-button';
        btn.innerText = option;
        btn.onclick = () => selectAnswer(option);
        optionsDiv.appendChild(btn);
    });

    document.getElementById('quiz').classList.add('fade-in');
    setTimeout(() => {
        document.getElementById('quiz').classList.remove('fade-in');
    }, 500);

    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 20;
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = "100%";
    timerBar.classList.remove('red-flash');

    timer = setInterval(() => {
        timeLeft--;
        timerBar.style.width = `${(timeLeft / 20) * 100}%`;

        if (timeLeft === 4) {
            if (!isMuted) {
                tickSound.play();
            }
        }

        if (timeLeft <= 5) {
            timerBar.classList.add('red-flash');
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            tickSound.pause();
            tickSound.currentTime = 0;
            autoNextQuestion();
        }
    }, 1000);
}

function selectAnswer(selected) {
    clearInterval(timer);
    if (!isMuted) {
        tickSound.pause();
        tickSound.currentTime = 0;
    }
    const buttons = document.querySelectorAll('#options button');
    const correctAnswer = questionsList[index].RightAnswer;

    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.innerText === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.innerText === selected) {
            btn.classList.add('wrong');
        }
    });

    if (selected === correctAnswer) {
        correct++;
        if (!isMuted) {
            correctSound.play(); 
        }
    } else {
        if (!isMuted) {
            wrongSound.play();  
        }
    }
    
    setTimeout(() => {
        index++;
        showQuestion();
    }, 1000);
}

function autoNextQuestion() {
    const buttons = document.querySelectorAll('#options button');
    buttons.forEach(btn => btn.disabled = true);
    setTimeout(() => {
        index++;
        showQuestion();
    }, 1000);
}
function finishQuiz() {
    document.getElementById('quiz').style.display = 'none';
    const score = (correct / questionsList.length) * 100;
    document.getElementById('result').style.display = 'block';

    let resultHTML = `<h2>Your Score: ${Math.round(score)}%</h2>`;

    if (score >= 90) {
        if (!isMuted) {
            levelupSound.play();
        }
        resultHTML += `<p>Congratulations! Next level unlocked!</p>`;
        unlockNextLevel();
    } else {
        resultHTML += `<p>Try again to pass!</p>`;
    }

    resultHTML += `
        <div style="margin-top: 30px;">
            <button id="return-button" onclick="returnToLevels()" style="font-size: 40px;">↩️</button>
            <button id="retry-button" onclick="retryLevel()" style="font-size: 40px;">🔄</button>
            ${score >= 90 ? `<button id="next-button" onclick="goToNextLevel()" style="font-size: 40px;">➡️</button>` : ''}
        </div>
    `;

    document.getElementById('result').innerHTML = resultHTML;
}

function unlockNextLevel() {
    const levelNum = parseInt(currentLevel.replace('level ', ''));
    localStorage.setItem(`NGSL-level${levelNum + 1}`, 'passed');
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// -------------------
// THEME TOGGLE SECTION
// -------------------

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            saveThemePreference();
        });
    }
}

function saveThemePreference() {
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}
function setupMuteToggle() {
    const muteButton = document.getElementById('mute-toggle');
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        muteButton.textContent = isMuted ? '🔈' : '🔇';
        localStorage.setItem('mute', isMuted ? 'true' : 'false');
    });
}

function loadMuteSetting() {
    const muteSetting = localStorage.getItem('mute');
    if (muteSetting === 'true') {
        isMuted = true;
        const muteButton = document.getElementById('mute-toggle');
        muteButton.textContent = '🔈';
    }
}


function returnToLevels() {
    document.getElementById('result').style.display = 'none';
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('level-select').style.display = 'block';
    document.getElementById('page-title').style.display = 'block';
}

function retryLevel() {
    index = 0;
    correct = 0;
    questionsList = shuffleArray(questions[currentLevel]).slice(0, 20);
    document.getElementById('result').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    showQuestion();
}

function goToNextLevel() {
    const currentLevelNum = parseInt(currentLevel.replace('level ', ''));
    const nextLevel = `level ${currentLevelNum + 1}`;
    if (questions[nextLevel]) {
        currentLevel = nextLevel;
        questionsList = shuffleArray(questions[nextLevel]).slice(0, 20);
        index = 0;
        correct = 0;
        document.getElementById('result').style.display = 'none';
        document.getElementById('quiz').style.display = 'block';
        showQuestion();
    } else {
        alert("Next level is not available.");
    }
}
