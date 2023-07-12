import axios from 'axios';
import { currentPage, queryImages } from './index';

const AUTH_TOKEN = '38178261-5d1780438eb32c09ef72874ba';
const BASE_URL = 'https://pixabay.com/api/';

async function getImages() {
  try {
    const arrImages = await axios.get(BASE_URL, {
      params: {
        key: AUTH_TOKEN,
        q: queryImages,
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

export { getImages };
