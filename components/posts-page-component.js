import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage } from "../index.js";
import { formatDistanceToNow } from "date-fns";
import ruLocale from "date-fns/locale/ru";
import { addLike, disLike } from "../api.js";

export const createPostHtml = (post, index) => {
  const likesNames = post.likes.map(like => like.name).join(", ");
  return `
    <li class="post">
      <div class="post-header" data-user-id="${post.user.id}">
        <img src="${post.user.imageUrl}" class="post-header__user-image">
        <p class="post-header__user-name">${post.user.name}</p>
      </div>
      <div class="post-image-container">
        <img class="post-image" src="${post.imageUrl}">
      </div>
      <div class="post-likes">
        <button data-post-id="${post.id}" class="like-button" data-index = ${index}>
          <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}">
        </button>
        <p class="post-likes-text">
        Нравится: <strong>${post.likes.length} (${likesNames})</strong>
        </p>
      </div>
      <p class="post-text">
        <span class="user-name">${post.user.name}</span>
        ${post.description}
      </p>
      <p class="post-date">
        ${formatDistanceToNow(new Date(post.createdAt), { locale: ruLocale })} назад
      </p>
    </li>`;
}

export const getPostHtml = (posts) => {
  return posts.map(createPostHtml).join('');
}

export const renderPostsPageComponent = ({ appEl, posts, userId, token, currentUserName }) => {
  console.log("Токен в renderPostsPageComponent:", token);

  console.log("Актуальный список постов:", posts);

  const postsHtml = getPostHtml(posts);

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  const like = (posts, token) => {
    console.log("Токен в функции like:", token);
    const likeButtons = document.querySelectorAll('.like-button');
    for(const like of likeButtons) {
      like.addEventListener('click', (event) => {
        if (!token) {
          alert('Вы должны войти в систему, чтобы ставить лайки');
          return;
        }
        event.stopPropagation();
        const postIndex = parseInt(like.dataset.index, 10);
        const post = posts[postIndex];
        console.log("Current post object:", post)
        const postLikesText = like.closest('.post-likes').querySelector('.post-likes-text strong');

         // При участии функции из апи


          if (post.isLiked === false) {
          addLike({ token, id: post.id })
            .then(() => {
              post.isLiked = true;
              like.querySelector("img").src = './assets/images/like-active.svg';
              post.likes.push({ id: userId, name: currentUserName });
              postLikesText.textContent = `${post.likes.length} (${currentUserName})`;
            })
            .catch((error) => {
              console.error("Ошибка при добавлении лайка:", error);
            });
        } else if (post.isLiked === true) {
          disLike({ token, id: post.id })
            .then(() => {
              post.isLiked = false;
              like.querySelector("img").src = './assets/images/like-not-active.svg';
              post.likes = post.likes.filter(like => like.name !== currentUserName);
              postLikesText.textContent = post.likes.length;
            })
            .catch((error) => {
              console.error("Ошибка при удалении лайка:", error);
            });
        }
        });
      }
    };
  like(posts, token);

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}