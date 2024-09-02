// TODO: write code here
import badPicture from '../svg/bad-picture.jpg';

console.log('Приложение загружено!');
document.addEventListener('DOMContentLoaded', () => {
  const errorMessage = document.querySelector('#error-message');
  const newsContainerWaiting = document.querySelector(
    '.news-container-waiting',
  );
  const newsContainer = document.querySelector('.news-container');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          './service-worker.js',
          { scope: './' },
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

  const formatDate = (date) => {
    date = new Date(date);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  };

  const displayImage = async (picture) => {
    const response = await fetch(picture);

    const newsPic = document.createElement('div');
    newsPic.className = 'news-picture';
    const imgElement = document.createElement('img');
    imgElement.id = 'image';
    imgElement.src = response.url;
    imgElement.alt = 'News Avatar';
    newsPic.append(imgElement);

    return newsPic;
  };

  const updateNews = async (news) => {
    for (const item of news) {
      const newsElement = document.createElement('div');
      newsElement.className = 'news';

      const newsDate = document.createElement('div');
      newsDate.className = 'news-datetime';
      newsDate.textContent = formatDate(item.received);
      newsElement.append(newsDate);

      const newsPicTit = document.createElement('div');
      newsPicTit.className = 'news-picture-titles';

      const newsPic = await displayImage(item.picture);
      newsPicTit.append(newsPic);

      const newsTit = document.createElement('div');
      newsTit.className = 'news-title';
      newsTit.textContent = item.title;
      newsPicTit.append(newsTit);
      newsElement.append(newsPicTit);

      newsContainer.append(newsElement);
    }

    newsContainerWaiting.classList.add('hidden');
    newsContainer.classList.remove('hidden');
  };

  const url = 'http://localhost:7070';
  fetch(`${url}/api/news`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      updateNews(data.news);
    })
    .catch((error) => {
      errorMessage.classList.remove('hidden');
      console.error('Ошибка:', error);
    });
});
