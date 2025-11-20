let questions = [];
let userAnswers = {};
let answeredCount = 0;

// Загружаем вопросы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        questions = await response.json();
        
        if (questions.length === 0) {
            document.getElementById('questions-container').innerHTML = 
                '<div class="loading">Вопросы не найдены. Запустите init_db.py для добавления вопросов.</div>';
            return;
        }
        
        renderQuestions();
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        document.getElementById('questions-container').innerHTML = 
            '<div class="loading">Ошибка загрузки вопросов. Проверьте подключение к серверу.</div>';
    }
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.id = `question-${question.id}`;
        
        let optionsHtml = '';
        question.options.forEach((option, optIndex) => {
            const optionNum = optIndex + 1;
            optionsHtml += `
                <div class="option" data-option="${optionNum}">
                    <input type="radio" 
                           name="question-${question.id}" 
                           id="q${question.id}-opt${optionNum}" 
                           value="${optionNum}">
                    <label for="q${question.id}-opt${optionNum}">${option}</label>
                </div>
            `;
        });
        
        questionBlock.innerHTML = `
            <div class="question-text">${index + 1}. ${question.question}</div>
            <div class="options">
                ${optionsHtml}
            </div>
            <div class="feedback" id="feedback-${question.id}"></div>
        `;
        
        container.appendChild(questionBlock);
        
        // Добавляем обработчики событий для вариантов ответа
        const options = questionBlock.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (userAnswers[question.id]) return; // Уже отвечен
                
                const optionNum = parseInt(option.dataset.option);
                selectAnswer(question.id, optionNum);
            });
        });
    });
}

async function selectAnswer(questionId, answer) {
    if (userAnswers[questionId]) return; // Уже отвечен
    
    // Отмечаем выбранный вариант
    const questionBlock = document.getElementById(`question-${questionId}`);
    const options = questionBlock.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.remove('selected');
        if (parseInt(opt.dataset.option) === answer) {
            opt.classList.add('selected');
        }
    });
    
    // Проверяем ответ
    try {
        const response = await fetch(`/api/check_answer/${questionId}/${answer}`);
        const result = await response.json();
        
        userAnswers[questionId] = {
            answer: answer,
            correct: result.correct
        };
        
        answeredCount++;
        
        // Показываем результат
        showFeedback(questionId, result.correct, answer);
        
        // Отключаем все варианты в этом вопросе
        options.forEach(opt => {
            opt.classList.add('disabled');
            opt.querySelector('input').disabled = true;
        });
        
        // Проверяем, все ли вопросы отвечены
        if (answeredCount === questions.length) {
            showResults();
        }
    } catch (error) {
        console.error('Ошибка проверки ответа:', error);
    }
}

function showFeedback(questionId, isCorrect, selectedAnswer) {
    const feedback = document.getElementById(`feedback-${questionId}`);
    const questionBlock = document.getElementById(`question-${questionId}`);
    const options = questionBlock.querySelectorAll('.option');
    
    // Помечаем правильный и неправильный ответы
    const question = questions.find(q => q.id === questionId);
    options.forEach(opt => {
        const optionNum = parseInt(opt.dataset.option);
        if (optionNum === question.correct_answer) {
            opt.classList.add('correct');
        } else if (optionNum === selectedAnswer && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    // Показываем текстовый фидбек
    feedback.textContent = isCorrect ? '✓ Правильно!' : '✗ Неправильно. Правильный ответ отмечен зеленым.';
    feedback.className = `feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
}

function showResults() {
    const correctCount = Object.values(userAnswers).filter(a => a.correct).length;
    const totalCount = questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    
    const resultsDiv = document.getElementById('results');
    const scoreDiv = document.getElementById('score');
    
    scoreDiv.innerHTML = `
        Правильных ответов: <span style="color: #28a745; font-size: 1.2em;">${correctCount}</span> из ${totalCount}<br>
        <span style="font-size: 0.9em; color: #666;">Процент правильных ответов: ${percentage}%</span>
    `;
    
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}
