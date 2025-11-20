import sqlite3

DATABASE = 'tests.db'

def init_database():
    """Инициализация базы данных с примерами вопросов"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Создаем таблицу если её нет
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
    
    # Проверяем, есть ли уже вопросы
    cursor.execute('SELECT COUNT(*) FROM questions')
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Добавляем примеры вопросов
        sample_questions = [
            (
                "Что такое Python?",
                "Язык программирования",
                "Вид змеи",
                "Название операционной системы",
                "Графический редактор",
                1
            ),
            (
                "Какой тип данных используется для хранения целых чисел в Python?",
                "str",
                "int",
                "float",
                "bool",
                2
            ),
            (
                "Что выведет код: print(2 + 2 * 2)?",
                "6",
                "8",
                "4",
                "Ошибка",
                1
            ),
            (
                "Какой метод используется для добавления элемента в конец списка?",
                "append()",
                "add()",
                "insert()",
                "push()",
                1
            ),
            (
                "Что такое HTTP?",
                "Протокол передачи гипертекста",
                "Язык программирования",
                "База данных",
                "Операционная система",
                1
            ),
            (
                "Какой символ используется для комментариев в Python?",
                "//",
                "#",
                "/*",
                "<!--",
                2
            ),
            (
                "Что такое Git?",
                "Система контроля версий",
                "Язык программирования",
                "База данных",
                "Веб-фреймворк",
                1
            ),
            (
                "Какой оператор используется для проверки равенства в Python?",
                "=",
                "==",
                "===",
                "equals",
                2
            ),
        ]
        
        cursor.executemany('''
            INSERT INTO questions (question, option1, option2, option3, option4, correct_answer)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', sample_questions)
        
        print(f"Добавлено {len(sample_questions)} примеров вопросов в базу данных.")
    else:
        print(f"В базе данных уже есть {count} вопросов.")
    
    conn.commit()
    conn.close()
    print("База данных готова к использованию!")

if __name__ == '__main__':
    init_database()

