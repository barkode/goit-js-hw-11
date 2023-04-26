export { onScroll, onToTopBtn };

const toTopBtn = document.querySelector('.btn-to-top');

window.addEventListener('scroll', onScroll);
toTopBtn.addEventListener('click', onToTopBtn);

function onScroll() {
  const scrolled = window.pageYOffset;
  const coords = document.documentElement.clientHeight;

  if (scrolled > coords) {
    toTopBtn.classList.add('btn-to-top--visible');
  }
  if (scrolled < coords) {
    toTopBtn.classList.remove('btn-to-top--visible');
  }
}

function onToTopBtn() {
  if (window.pageYOffset > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// const options = {
//   rootMargin: '300px',
// };

// const onEntry = entries => {
//   const search = searchForm.elements.searchQuery.value.trim();
//   entries.forEach(entry => {
//     if (entry.isIntersecting && search !== '') {
//       console.log('Need to download');
//       onLoadMoreClick();
//     }
//   });
// };

// const observer = new IntersectionObserver(onEntry, options);

// observer.observe(sentinel);
