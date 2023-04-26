// import axios from 'axios';
// import Notiflix from 'notiflix';
// import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';
// import { renderGallery } from './js/rendergallery';

// const refs = {
//   form: document.querySelector('#search-form'),
//   gallery: document.querySelector('.gallery'),
//   sentinel: document.querySelector('#sentinel'),
// };

// let page = 1;
// //let total = 0;

// refs.form.addEventListener('submit', onFormSubmit);

// const lightbox = new SimpleLightbox('.gallery a', {});

// function onFormSubmit(e) {
//   page = 1;
//   e.preventDefault();
//   const search = refs.form.elements.searchQuery.value.trim();
//   if (!search) {
//     Notiflix.Notify.info(
//       'Sorry, there are no images matching your search query. Please try again.'
//     );
//     return;
//   }
//   clearMarkup();
//   generateMarkup(search);
// }

// function onLoadMoreClick() {
//   const search = refs.form.elements.searchQuery.value.trim();
//   page += 1;
//   generateMarkup(search);
// }

// async function getPosts(search) {
//   const key = '34788897-0984568366e20e342331605e4';
//   const imageType = 'photo';
//   const orientation = 'horizontal';
//   const safesearch = true;
//   const perPage = 40;
//   const URL = `https://pixabay.com/api/?key=${key}&q=${search}&image_type=${imageType}&orientation=${orientation}&safesearch=${safesearch}&per_page=${perPage}&page=${page}`;
//   try {
//     const response = await axios(URL);
//     const data = response.data.hits;
//     if (data.length === 0) {
//       Notiflix.Notify.failure(
//         'Sorry, there are no images matching your search query. Please try again.'
//       );
//       return;
//     }
//     return data;
//   } catch (error) {
//     console.log('error');
//   }
// }

// function createMarkup(item) {
//   return `<a href="${item.largeImageURL}" class="gallery__item"
//         > <div class="card">
//         <img src="${item.webformatURL}" alt="${item.tags}" class="gallery__image" loading="lazy" title=""
//       />
//        <div class="info">
//     <p class="info-item">
//       <b>Likes:</b> ${item.likes}
//     </p>
//     <p class="info-item">
//       <b>Views</b> ${item.views}
//     </p>
//     <p class="info-item">
//       <b>Comments</b> ${item.comments}
//     </p>
//     <p class="info-item">
//       <b>Downloads</b> ${item.downloads}
//     </p>
//   </div>
//   </div>
//       </a>
//    `;
// }

// async function generateMarkup(search) {
//   const data = await getPosts(search);
//   const markup = data.reduce((acc, item) => {
//     return acc + createMarkup(item);
//   }, '');

//   refs.gallery.insertAdjacentHTML('beforeend', markup);

//   lightbox.refresh();
//   return data;
// }

// function clearMarkup() {
//   refs.gallery.innerHTML = '';
// }

import { getImages } from './js/getImages';
import { renderGallery } from './js/rendergallery';
import { onScroll, onToTopBtn } from './js/scroll';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.btn-load-more');
const sentinel = document.getElementById('sentinel');
let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);
loadMoreBtn.addEventListener('click', onLoadMoreBtn);

onScroll();
onToTopBtn();

function onSearchForm(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');

  if (query === '') {
    alertNoEmptySearch();
    return;
  }

  getImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoImagesFound();
      } else {
        renderGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        alertImagesFound(data);

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

function onLoadMoreBtn() {
  page += 1;
  simpleLightBox.destroy();

  getImages(query, page, perPage)
    .then(({ data }) => {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        loadMoreBtn.classList.add('is-hidden');
        alertEndOfSearch();
      }
    })
    .catch(error => console.log(error));
}

function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure(
    'The search string cannot be empty. Please specify your search query.'
  );
}

function alertNoImagesFound() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function alertEndOfSearch() {
  Notiflix.Notify.failure(
    "We're sorry, but you've reached the end of search results."
  );
}

// Infinity scroll

const options = {
  rootMargin: '300px',
};

const onEntry = entries => {
  const search = searchForm.elements.searchQuery.value.trim();
  entries.forEach(entry => {
    if (entry.isIntersecting && search !== '') {
      console.log('Need to download');
      onLoadMoreBtn();
    }
  });
};

const observer = new IntersectionObserver(onEntry, options);

observer.observe(sentinel);
