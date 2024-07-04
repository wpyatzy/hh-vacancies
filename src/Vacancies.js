import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

async function saveVacancyToDB(vacancy) {
  try {
    await axios.post('https://api.hh.ru/vacancies', vacancy);
    console.log('Vacancy saved');
  } catch (error) {
    console.log('Error saving vacancy:', error);
  }
}

const Vacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalFound, setTotalFound] = useState(0);

  useEffect(() => {
    fetchVacancies('python', 0);
  }, []);
  
  const fetchVacancies = async (query, page) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://api.hh.ru/vacancies', {
        params: {
          text: query,
          per_page: 10,
          page: page,
        },
      });
      setVacancies(response.data.items);
      setTotalFound(response.data.found);
      response.data.items.forEach(saveVacancyToDB);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(0);
    fetchVacancies(searchTerm, 0);
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVacancies(searchTerm, nextPage);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchVacancies(searchTerm, prevPage);
    }
  };

  return (
    <div className="vacancies-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Введите ключевые слова"
        />
        <button type="submit">Поиск</button>
      </form>
      <div className="results-info">
        {loading && <div>Загрузка...</div>}
        {error && <div>Ошибка: {error.message}</div>}
        {!loading && !error && (
          <div>
            <p>Найдено вакансий: {totalFound}</p>
            {vacancies.length === 0 && <p>Вакансии не найдены.</p>}
          </div>
        )}
      </div>
      <div className="vacancies-grid">
        {vacancies.map((vacancy) => (
          <div key={vacancy.id} className="vacancy">
            <h2>{vacancy.name}</h2>
            <p>Компания: {vacancy.employer.name}</p>
            <p>Зарплата: {vacancy.salary ? `${vacancy.salary.from} - ${vacancy.salary.to} ${vacancy.salary.currency}` : 'Не указана'}</p>
            <p>Город: {vacancy.area.name}</p>
            <p>Описание: {vacancy.snippet.responsibility ? `${vacancy.snippet.responsibility}` : "Не указано"}</p>
            <p>Требования: {vacancy.snippet.requirement ? `${vacancy.snippet.requirement}` : "Не указаны"}</p>
            <a href={vacancy.alternate_url} target="_blank" rel="noopener noreferrer">Подробнее</a>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 0}>Предыдущая</button>
        <button onClick={handleNextPage}>Следующая</button>
      </div>
    </div>
  );
};

export default Vacancies;
