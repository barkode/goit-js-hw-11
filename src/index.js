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

const infinityScrollOptions = {
  rootMargin: '400px',
};

searchForm.addEventListener('submit', onSearchForm);
// loadMoreBtn.addEventListener('click', onLoadMoreBtn);

onScroll();
onToTopBtn();

function onSearchForm(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  // Image Search by world
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
        return;
      } //else {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();
      alertImagesFound(data);

      // if (data.totalHits > perPage) {
      //   loadMoreBtn.classList.remove('is-hidden');
      // }
      //}
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

function onLoadMoreBtn() {
  //page += 1;
  simpleLightBox.destroy();

  getImages(query, page, perPage)
    .then(({ data }) => {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.total / perPage);

      if (page >= totalPages) {
        //   loadMoreBtn.classList.add('is-hidden');
        alertEndOfSearch();
        //observer.unobserve(sentinel);
        //return;
        //} else {
        //  page += 1;
      }
    })
    .catch(error => console.log(error));
}

function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.total} images.`);
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

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && query !== '') {
      onLoadMoreBtn();
    }
  });
};

const observer = new IntersectionObserver(onEntry, infinityScrollOptions);

observer.observe(sentinel);
