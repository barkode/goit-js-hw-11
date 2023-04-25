import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  sentinel: document.querySelector('#sentinel'),
};

let page = 1;
//let total = 0;

refs.form.addEventListener('submit', onFormSubmit);

const lightbox = new SimpleLightbox('.gallery a', {});

function onFormSubmit(e) {
  page = 1;
  e.preventDefault();
  const search = refs.form.elements.searchQuery.value.trim();
  if (!search) {
    Notiflix.Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  clearMarkup();
  generateMarkup(search);
}

function onLoadMoreClick() {
  const search = refs.form.elements.searchQuery.value.trim();
  page += 1;
  generateMarkup(search);
}

async function getPosts(search) {
  const key = '34788897-0984568366e20e342331605e4';
  const imageType = 'photo';
  const orientation = 'horizontal';
  const safesearch = true;
  const perPage = 40;
  const URL = `https://pixabay.com/api/?key=${key}&q=${search}&image_type=${imageType}&orientation=${orientation}&safesearch=${safesearch}&per_page=${perPage}&page=${page}`;
  try {
    const response = await axios(URL);
    const data = response.data.hits;
    if (data.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    return data;
  } catch (error) {
    console.log('error');
  }
}

function createMarkup(item) {
  return `<a href="${item.largeImageURL}" class="gallery__item"
        > <div class="card">
        <img src="${item.webformatURL}" alt="${item.tags}" class="gallery__image" loading="lazy" title=""
      />
       <div class="info">
    <p class="info-item">
      <b>Likes:</b> ${item.likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${item.views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${item.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${item.downloads}
    </p>
  </div>
  </div>
      </a>
   `;
}

async function generateMarkup(search) {
  const data = await getPosts(search);
  const markup = data.reduce((acc, item) => {
    return acc + createMarkup(item);
  }, '');

  refs.gallery.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();
  return data;
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}

const options = {
  rootMargin: '300px',
};

const onEntry = entries => {
  const search = refs.form.elements.searchQuery.value.trim();
  entries.forEach(entry => {
    if (entry.isIntersecting && search !== '') {
      console.log('Need to download');
      onLoadMoreClick();
    }
  });
};

const observer = new IntersectionObserver(onEntry, options);

observer.observe(refs.sentinel);
