// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const timerElement = document.getElementById('time');
const currentQElement = document.getElementById('current-q');
const totalQElement = document.getElementById('total-q');
const scoreElement = document.getElementById('score');
const totalElement = document.getElementById('total');
const progressFill = document.getElementById('progress-fill');

// Quiz Variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 5;
let totalQuestions = 5;
let selectedOption = null;

// Event Listeners
startBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', restartQuiz);

// Initialize
totalQElement.textContent = totalQuestions;

// Functions
async function startQuiz() {
    const questionCount = document.getElementById('question-count').value;
    const category = document.getElementById('category').value;
    totalQuestions = parseInt(questionCount);
    
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=${questionCount}&category=${category}`);
        const data = await response.json();
        
        questions = data.results.map(q => ({
            question: decodeHTML(q.question),
            options: shuffleArray([
                { text: decodeHTML(q.correct_answer), correct: true },
                ...q.incorrect_answers.map(a => ({ text: decodeHTML(a), correct: false }))
            ])
        }));
        
        setupScreen.classList.add('hide');
        quizScreen.classList.remove('hide');
        totalQElement.textContent = totalQuestions;
        showQuestion();
    } catch (error) {
        alert("Failed to load questions. Please try again.");
        console.error(error);
    }
}

function showQuestion() {
    resetState();
    const question = questions[currentQuestionIndex];
    currentQElement.textContent = currentQuestionIndex + 1;
    
    // Update progress
    progressFill.style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;
    
    questionElement.textContent = question.question;
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = `${index + 1}. ${option.text}`;
        optionElement.dataset.correct = option.correct;
        optionElement.addEventListener('click', selectAnswer);
        optionsContainer.appendChild(optionElement);
    });
    
    startTimer();
}

function startTimer() {
    timeLeft = 5;
    timerElement.textContent = timeLeft;
    clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

function selectAnswer(e) {
    clearInterval(timer);
    selectedOption = e.target;
    const correct = selectedOption.dataset.correct === 'true';
    
    if (correct) score++;
    
    // Show correct/wrong answers
    Array.from(optionsContainer.children).forEach(option => {
        option.style.pointerEvents = 'none';
        if (option.dataset.correct === 'true') {
            option.classList.add('correct');
        } else {
            option.classList.add('wrong');
        }
    });
    
    // Move to next question after delay
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

function handleTimeout() {
    // Highlight correct answer when time runs out
    Array.from(optionsContainer.children).forEach(option => {
        option.style.pointerEvents = 'none';
        if (option.dataset.correct === 'true') {
            option.classList.add('correct');
        }
    });
    
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');
    scoreElement.textContent = score;
    totalElement.textContent = totalQuestions;
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultScreen.classList.add('hide');
    setupScreen.classList.remove('hide');
}

function resetState() {
    clearInterval(timer);
    selectedOption = null;
    optionsContainer.innerHTML = '';
}

// Helper Functions
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}