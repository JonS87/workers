// TODO: write code here
console.log('Приложение загружено!');
document.addEventListener('DOMContentLoaded', () => {
  const errorMessage = document.querySelector('#error-message');
  const successMessage = document.querySelector('#success-message');
  const newsContainer = document.querySelector('#news-container');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          './src/service-worker.js',
          { scope: './src/' },
        );
        console.log(
          'Service Worker registered with scope:',
          registration.scope,
        );
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }

  const url = 'http://localhost:7070';

  fetch(`${url}/api/news`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.news);
      successMessage.style.display = 'flex';
    })
    .catch((error) => {
      errorMessage.style.display = 'flex';
      console.error('Ошибка:', error);
    });
});
