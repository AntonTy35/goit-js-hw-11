import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { getImages } from './images';
import { imagesMarkup } from './markup';

const searchForm = document.querySelector('.search-form');
const galleryEls = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';

const simpleLightBox = new SimpleLightbox('.gallery a');

searchForm.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

let currentPage = 1;
let totalPage = 0;
let queryImages = '';

export { currentPage, queryImages };

async function onSearchFormSubmit(event) {
  event.preventDefault();
  loadMoreBtn.style.display = 'none';

  currentPage = 1;
  queryImages = searchForm.firstElementChild.value;

  if (!queryImages) {
    event.currentTarget.reset();
    galleryEls.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    currentPage = 1;
    return;
  }

  try {
    const images = await getImages();

    galleryEls.innerHTML = imagesMarkup(images.data.hits);
    simpleLightBox.refresh();

    if (images.data.hits.length) {
      Notify.success(`Hooray! We found ${images.data.totalHits} images.`);
    } else {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      galleryItemsEl.innerHTML = '';
      loadMoreBtn.style.display = 'flex';
    }
    totalPage = Math.ceil(images.data.totalHits / images.data.hits.length);

    if (totalPage > currentPage) {
      loadMoreBtn.style.display = 'flex';
    }
  } catch (error) {
    console.error(error);
    galleryEls.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    currentPage = 1;
  }
}

async function onLoadMoreBtnClick() {
  currentPage += 1;
  if (currentPage === totalPage) {
    loadMoreBtn.style.display = 'none';
    Notify.failure('Were sorry, but youve reached the end of search results.');
  }
  try {
    const loadMore = await getImages();
    galleryEls.insertAdjacentHTML(
      'beforeend',
      imagesMarkup(loadMore.data.hits)
    );
    simpleLightBox.refresh();
  } catch (error) {
    console.error(error);
    galleryEls.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    currentPage = 1;
  }
}
