from flask import Flask, render_template, jsonify
import sqlite3
import os

app = Flask(__name__)
DATABASE = 'tests.db'

def get_db():
    """Подключение к базе данных"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Инициализация базы данных"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Создаем таблицу вопросов
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option1 TEXT NOT NULL,
            option2 TEXT NOT NULL,
            option3 TEXT NOT NULL,
            option4 TEXT NOT NULL,
            correct_answer INTEGER NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    """API для получения всех вопросов"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM questions ORDER BY id')
    questions = cursor.fetchall()
    conn.close()
    
    # Преобразуем в список словарей
    result = []
    for q in questions:
        result.append({
            'id': q['id'],
            'question': q['question'],
            'options': [
                q['option1'],
                q['option2'],
                q['option3'],
                q['option4']
            ],
            'correct_answer': q['correct_answer']
        })
    
    return jsonify(result)

@app.route('/api/check_answer/<int:question_id>/<int:answer>')
def check_answer(question_id, answer):
    """API для проверки ответа"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT correct_answer FROM questions WHERE id = ?', (question_id,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        is_correct = (result['correct_answer'] == answer)
        return jsonify({'correct': is_correct})
    return jsonify({'error': 'Question not found'}), 404

if __name__ == '__main__':
    # Инициализируем БД при первом запуске
    if not os.path.exists(DATABASE):
        init_db()
        print("База данных создана. Запустите init_db.py для добавления примеров вопросов.")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

