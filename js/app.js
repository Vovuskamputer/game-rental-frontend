let currentEquipment = null;

function showLoading(message = 'Загрузка... Это займет несколько секунд') {
  document.getElementById('app').innerHTML = `<h2>${message}</h2>`;
}

function showEquipment() {
  if (!getCurrentUser()) {
    document.getElementById('app').innerHTML = '<h1>Требуется вход</h1>';
    return;
  }

  const url = `${BACKEND_URL}?action=getEquipment`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        let html = `
          <h2>Оборудование:</h2>
          <table border="1">
            <tr>
              <th>Маркировка</th>
              <th>Тип</th>
              <th>Состояние</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Окончание аренды</th>
              <th>Действие</th>
            </tr>`;

        for (const item of data.equipment) {
          if (item.Состояние === 'Свободен') {
            html += `<tr>
              <td>${item.Маркировка}</td>
              <td>${item.Тип}</td>
              <td>${item.Состояние}</td>
              <td colspan="3" style="text-align:center;">—</td>
              <td><button onclick="showContractForm('${item.Маркировка}')">Создать договор</button></td>
            </tr>`;
          } else if (item.Состояние === 'В аренде') {
            html += `<tr>
              <td>${item.Маркировка}</td>
              <td>${item.Тип}</td>
              <td>${item.Состояние}</td>
              <td>${item.Клиент || '—'}</td>
              <td>${item.Телефон || '—'}</td>
              <td>${item.Окончание || '—'}</td>
              <td><button onclick="returnEquipment('${item.Маркировка}')">Вернуть</button></td>
            </tr>`;
          }
        }
        html += '</table>';
        document.getElementById('app').innerHTML = html;
      } else {
        document.getElementById('app').innerHTML = '<h1>Ошибка загрузки оборудования</h1>';
      }
    })
    .catch(() => {
      document.getElementById('app').innerHTML = '<h1>Сетевая ошибка</h1>';
    });
}

function showContractForm(marking) {
  currentEquipment = marking;
  const html = `
    <h2>Создание договора для ${marking}</h2>
    <form id="contractForm">
      <label>ФИО клиента:<br><input type="text" id="fullName" required></label><br><br>
      <label>Телефон:<br><input type="tel" id="phone" required></label><br><br>
      <label>Срок аренды (дней):<br><input type="number" id="duration" min="1" value="7" required></label><br><br>
      <label>Сумма оплаты (руб):<br><input type="number" id="amount" min="0" required></label><br><br>
      <label>Тип оплаты:<br>
        <select id="paymentType" required>
          <option value="Наличные">Наличные</option>
          <option value="Карта">Карта</option>
          <option value="Перевод">Перевод</option>
        </select>
      </label><br><br>
      <button type="submit">Создать договор</button>
      <button type="button" onclick="showEquipment()">Назад</button>
    </form>
  `;
  document.getElementById('app').innerHTML = html;
  document.getElementById('contractForm').addEventListener('submit', createContract);
}

function createContract(e) {
  e.preventDefault();
  
  showLoading(); // ← "Загрузка... Это займет несколько секунд"

  const createdBy = getCurrentUser()?.name || 'Неизвестно';

  const url = `${BACKEND_URL}?action=saveContract` +
    `&equipment=${encodeURIComponent(currentEquipment)}` +
    `&fullName=${encodeURIComponent(document.getElementById('fullName').value)}` +
    `&phone=${encodeURIComponent(document.getElementById('phone').value)}` +
    `&duration=${encodeURIComponent(document.getElementById('duration').value)}` +
    `&amount=${encodeURIComponent(document.getElementById('amount').value)}` +
    `&paymentType=${encodeURIComponent(document.getElementById('paymentType').value)}` +
    `&createdBy=${encodeURIComponent(createdBy)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Показываем успех
        document.getElementById('app').innerHTML = `
          <h2>✅ Договор успешно создан!</h2>
          <p><strong>Номер:</strong> ${data.contractNumber}</p>
          <p>Загрузка... Это займет несколько секунд</p>
        `;
        setTimeout(() => showEquipment(), 2500);
      } else {
        alert('Ошибка при создании договора');
        showEquipment();
      }
    })
    .catch(() => {
      alert('Сетевая ошибка');
      showEquipment();
    });
}

function returnEquipment(marking) {
  if (!confirm(`Вы уверены, что хотите вернуть комплект ${marking}?`)) return;

  showLoading(); // ← "Загрузка... Это займет несколько секунд"

  const url = `${BACKEND_URL}?action=returnEquipment&marking=${encodeURIComponent(marking)}`;
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('app').innerHTML = `
          <h2>✅ Оборудование успешно возвращено!</h2>
          <p>Загрузка... Это займет несколько секунд</p>
        `;
        setTimeout(() => showEquipment(), 2000);
      } else {
        alert('Ошибка при возврате');
        showEquipment();
      }
    })
    .catch(() => {
      alert('Сетевая ошибка');
      showEquipment();
    });
}

// Обработка входа
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const loginValue = document.getElementById('login').value;
  const passwordValue = document.getElementById('password').value;
  
  showLoading(); // ← единый стиль

  try {
    await login(loginValue, passwordValue);
    showEquipment();
  } catch (err) {
    alert('Ошибка: ' + err.message);
    document.getElementById('app').innerHTML = `
      <h1>Вход в систему аренды оборудования</h1>
      <form id="loginForm">
        <label>Логин:<br><input type="text" id="login" required autocomplete="username"></label><br><br>
        <label>Пароль:<br><input type="password" id="password" required autocomplete="current-password"></label><br><br>
        <button type="submit">Войти</button>
      </form>
    `;
    document.getElementById('loginForm').addEventListener('submit', arguments.callee);
  }
});
