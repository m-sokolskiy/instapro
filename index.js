import { getPosts, createPost, getPostsByUser } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];
export let currentUserId = null; 

// Получаем токен
export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

// Вход-выход
export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

export const updatePostsAndGoToPostsPage = () => {
  page = LOADING_PAGE;
  renderApp();

  return getPosts({ token: getToken() })
    .then((newPosts) => {
      page = POSTS_PAGE;
      posts = newPosts;
      renderApp();
    })
    .catch((error) => {
      console.error(error);
      goToPage(POSTS_PAGE);
    });
};

// Выбор страниц
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();
      currentUserId = data.userId;
    
      return getPostsByUser({ token: getToken(), id: data.userId })
        .then((newPosts) => {
          console.log('Posts returned by getPostsByUser:', newPosts);
          page = USER_POSTS_PAGE;
          posts = newPosts.posts; ;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }
    
    page = newPage;
    renderApp();
    return;
  }
  throw new Error("страницы не существует");
};

// Рендер страниц 
export const renderApp = () => {
  const appEl = document.getElementById("app");
  const currentUserName = user ? user.name : null;
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        createPost({ token: getToken(), description, imageUrl })
          .then((post) => {
            console.log("Добавленный пост:", post);
            updatePostsAndGoToPostsPage();
          })
          .catch((error) => {
            console.error("Ошибка при добавлении поста:", error);
          });
      },
    });
  }

  if (page === POSTS_PAGE || page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
      posts,
      userId: page === USER_POSTS_PAGE ? currentUserId : null,
      token: getToken(),
      currentUserName,
    });
  }

};

// Старт приожения
goToPage(POSTS_PAGE);