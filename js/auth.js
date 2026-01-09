let currentUser = null;

function login(login, password) {
  const url = `${BACKEND_URL}?action=login&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`;
  
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        currentUser = data.user;
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error);
      }
    });
}

function getCurrentUser() {
  return currentUser;
}

function logout() {
  currentUser = null;
}
