import React from 'react';
import Vacancies from './Vacancies.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>HH.ru Вакансии</h1>
      </header>
      <main>
        <Vacancies />
      </main>
    </div>
  );
}

export default App;
