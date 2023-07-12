import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const AUTH_TOKEN = '38178261-5d1780438eb32c09ef72874ba';

const BASE_URL = 'https://pixabay.com/api/';

const searchForm = document.querySelector('.search-form');
const galleryEls = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';

const simpleLightBox = new SimpleLightbox('.gallery a');

searchForm.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

let currentPage = 1;
let totalPage = 0;

async function onSearchFormSubmit(event) {
  event.preventDefault();
  currentPage = 1;

  if (!searchForm.firstElementChild.value) {
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

async function getImages() {
  try {
    const arrImages = await axios.get(BASE_URL, {
      params: {
        key: AUTH_TOKEN,
        q: searchForm.firstElementChild.value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: currentPage,
      },
    });
    return arrImages;
  } catch (error) {
    console.error(error);
  }
}

function imagesMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
            <a href="${largeImageURL}">
              <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b>${likes}
                </p>
                <p class="info-item">
                    <b>Views</b>${views}
                </p>
                <p class="info-item">
                    <b>Comments</b>${comments}
                </p>
                <p class="info-item">
                    <b>Downloads</b>${downloads}
                </p>
            </div>
        </div>`
    )
    .join('');
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
