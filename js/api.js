async function testLogin(login, password) {
  const url = `${BACKEND_URL}?action=login&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
    if (data.success) {
      document.getElementById('app').innerHTML = `<h1>Привет, ${data.user.name}!</h1>`;
    } else {
      document.getElementById('app').innerHTML = `<h1>Ошибка: ${data.error}</h1>`;
    }
  } catch (err) {
    document.getElementById('app').innerHTML = `<h1>Сетевая ошибка</h1>`;
  }
}

// Замени testBackend() на тест входа
testLogin('admin', 'password');
