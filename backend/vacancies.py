import requests
import mysql.connector

db = mysql.connector.connect(host="sql7.freesqldatabase.com",
                           user="sql7718093",
                           password="QM2Gu1FjSb",
                           database="sql7718093",
                           port=3306,
                           autocommit=True)
cursor = db.cursor(dictionary=True)

cursor.execute("""TRUNCATE vacancies""")
cursor.execute("""TRUNCATE req""")
cursor.execute("""TRUNCATE desq""")
cursor.execute("""TRUNCATE salary""")
print('Database cleared')

url_v = 'https://api.hh.ru/vacancies'
a=0
for page in range(5):
    params = {
        'per_page': 25,
        'page': page
    }
    response = requests.get(url_v, params=params)
        
    # Проверяем статус-код ответа
    if response.status_code == 200:
        vacancies = response.json()
            
        for item in vacancies['items']:
            query = """
            INSERT INTO vacancies (id, name, employer, area,  url)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name), employer = VALUES(employer), area = VALUES(area), url = VALUES(url)
            """
            cursor.execute(query, (item['id'], item['name'], item['employer']['name'], item['area']['name'], item['alternate_url']))
            db.commit()
                
            if item['salary'] is not None:
                if (item['salary']['from'] and item['salary']['to']) is not None:
                    query = """
                    INSERT INTO salary (id, sfrom, sto, currency) 
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    sfrom = VALUES(sfrom), sto = VALUES(sto), currency = VALUES(currency)"""
                    cursor.execute(query, (item['id'], item['salary']['from'], item['salary']['to'], item['salary']['currency']))
                    db.commit()
                elif item['salary']['from'] is not None:
                    query = """INSERT INTO salary (id, sfrom, currency) 
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    sfrom = VALUES(sfrom), currency = VALUES(currency)"""
                    cursor.execute(query, (item['id'], item['salary']['from'], item['salary']['currency']))
                    db.commit()
                elif item['salary']['to'] is not None:
                    query = """INSERT INTO salary (id, sto, currency) 
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    sfrom = VALUES(sto), currency = VALUES(currency)"""
                    cursor.execute(query, (item['id'], item['salary']['to'], item['salary']['currency']))
                    db.commit()

            if item['snippet']['responsibility'] is not None:
                query = """INSERT INTO desq (id, desq) 
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE
                desq = VALUES(desq)"""
                cursor.execute(query, (item['id'], item['snippet']['responsibility']))
                db.commit()

            if item['snippet']['requirement'] is not None:
                query = """INSERT INTO req (id, req) 
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE
                req = VALUES(req)"""
                cursor.execute(query, (item['id'], item['snippet']['requirement']))
                db.commit()
        a+=25
        print('Vacancies fetched and saved:', a)
                
    else:
        print(f"Ошибка выполнения запроса: {response.status_code}")
