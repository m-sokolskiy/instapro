const baseHost = "https://wedev-api.sky.pro";
const postsHost = "https://wedev-api.sky.pro/api/v1/sokolskiy-maksim/instapro"

// Получаем все посты
export const getPosts = ({ token }) => {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

// Добавляем пост
export const createPost = ({ token, description, imageUrl }) => {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      description,
      imageUrl,
    }),
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
}

// Получаем посты пользователя
export const getPostsByUser = ({ token, id }) => {
  return fetch(`${postsHost}/user-posts/${id}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
  .then((response) => response.json());
};

// Регистрация
export const registerUser = ({ login, password, name, imageUrl }) => { // https://github.com/GlebkaF/webdev-hw-api/blob/main/pages/api/user/README.md#%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%D1%81%D1%8F
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

// Авторизация
export const loginUser = ({ login, password }) => {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает Фото
export const uploadImage = ({ file }) => {  
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

// Добавяет лайк
export const addLike = ({token, id}) => {
  return fetch(postsHost + `/${id}/like`,{
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
  .then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }

    return response.json();
  })
}

// Убирает лайк
export const disLike = ({token, id}) => {
  return fetch(postsHost + `/${id}/dislike`,{
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
  .then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }

    return response.json();
  })
}