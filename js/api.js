async function testBackend() {
  try {
    const res = await fetch(BACKEND_URL);
    const data = await res.json();
    document.getElementById('app').innerHTML = `<h1>${data.message}</h1>`;
  } catch (err) {
    document.getElementById('app').innerHTML = `<h1>Ошибка подключения</h1>`;
  }
}

testBackend();