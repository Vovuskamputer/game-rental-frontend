let currentEquipment = null;
let isSubmitting = false;
let isReturning = false;
let currentUser = null;

function getCurrentUser() {
  return currentUser;
}

function setCurrentUser(user) {
  currentUser = user;
}

function showLoading(message = 'Загрузка... Это займет несколько секунд') {
  document.getElementById('app').innerHTML = `<h2>${message}</h2>`;
}

function goBackToEquipment() {
  showLoading('Возврат к списку оборудования...');
  setTimeout(showEquipment, 500); // небольшая задержка для плавности
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
      <button type="button" onclick="goBackToEquipment()">Назад</button>
    </form>
  `;
  document.getElementById('app').innerHTML = html;
  
  // Удаляем старый обработчик и добавляем новый
  const form = document.getElementById('contractForm');
  form.onsubmit = null;
  form.addEventListener('submit', createContract);
}

function createContract(e) {
  e.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;

  // Читаем данные ДО showLoading!
  const fullName = document.getElementById('fullName').value;
  const phone = document.getElementById('phone').value;
  const duration = document.getElementById('duration').value;
  const amount = document.getElementById('amount').value;
  const paymentType = document.getElementById('paymentType').value;
  const createdBy = getCurrentUser()?.name || 'Админ';

  showLoading('Создание договора...');

  const url = `${BACKEND_URL}?action=saveContract` +
    `&equipment=${encodeURIComponent(currentEquipment)}` +
    `&fullName=${encodeURIComponent(fullName)}` +
    `&phone=${encodeURIComponent(phone)}` +
    `&duration=${encodeURIComponent(duration)}` +
    `&amount=${encodeURIComponent(amount)}` +
    `&paymentType=${encodeURIComponent(paymentType)}` +
    `&createdBy=${encodeURIComponent(createdBy)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('app').innerHTML = `
          <h2>✅ Договор успешно создан!</h2>
          <p><strong>Номер:</strong> ${data.contractNumber}</p>
          <p>Возврат к таблице через 3 секунды...</p>
        `;
        setTimeout(() => {
          isSubmitting = false;
          showEquipment(); // при возврате будет "Загрузка..."
        }, 3000);
      } else {
        alert('Ошибка при создании договора');
        isSubmitting = false;
        showEquipment();
      }
    })
    .catch(() => {
      alert('Сетевая ошибка');
      isSubmitting = false;
      showEquipment();
    });
}

function returnEquipment(marking) {
  if (!confirm(`Вы уверены, что хотите вернуть комплект ${marking}?`)) return;
  if (isReturning) return;
  isReturning = true;

  showLoading('Выполняется возврат оборудования...');

  const url = `${BACKEND_URL}?action=returnEquipment&marking=${encodeURIComponent(marking)}`;
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('app').innerHTML = `
          <h2>✅ Оборудование успешно возвращено!</h2>
          <p>Возврат к таблице через 2 секунды...</p>
        `;
        setTimeout(() => {
          isReturning = false;
          showEquipment();
        }, 2000);
      } else {
        alert('Ошибка при возврате');
        isReturning = false;
        showEquipment();
      }
    })
    .catch(() => {
      alert('Сетевая ошибка');
      isReturning = false;
      showEquipment();
    });
}

// Форма входа
function showLoginForm() {
  document.getElementById('app').innerHTML = `
    <h1>Вход в систему аренды оборудования</h1>
    <form id="loginForm">
      <label>Логин:<br><input type="text" id="login" required autocomplete="username"></label><br><br>
      <label>Пароль:<br><input type="password" id="password" required autocomplete="current-password"></label><br><br>
      <button type="submit">Войти</button>
    </form>
  `;
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const loginValue = document.getElementById('login').value;
  const passwordValue = document.getElementById('password').value;
  
  showLoading('Проверка логина и пароля...');

  try {
    // Шаг 1: проверка логина/пароля
    const loginRes = await fetch(`${BACKEND_URL}?action=login&login=${encodeURIComponent(loginValue)}&password=${encodeURIComponent(passwordValue)}`);
    const loginData = await loginRes.json();
    
    if (!loginData.success) throw new Error(loginData.error);

    // Шаг 2: запрос 2FA-кода
    showLoading('Отправка кода в Telegram...');
    const reqRes = await fetch(`${BACKEND_URL}?action=request2FA&login=${encodeURIComponent(loginValue)}`);
    const reqData = await reqRes.json();
    
    if (!reqData.success) throw new Error(reqData.error);

    // Шаг 3: форма ввода кода
    document.getElementById('app').innerHTML = `
      <h1>🔐 Двухфакторная аутентификация</h1>
      <p>Введите 6-значный код из Telegram:</p>
      <form id="2faForm" style="margin-top:20px;">
        <input type="text" id="2faCode" maxlength="6" required 
               style="font-size:20px; padding:10px; text-align:center; width:120px;">
        <br><br>
        <button type="submit">Подтвердить</button>
        <button type="button" onclick="showLoginForm()">Отмена</button>
      </form>
    `;
    
    document.getElementById('2faForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const code = document.getElementById('2faCode').value;
      if (code.length !== 6 || isNaN(code)) {
        alert('Код должен содержать 6 цифр');
        return;
      }
      
      showLoading('Проверка кода...');
      const vRes = await fetch(`${BACKEND_URL}?action=verify2FA&login=${encodeURIComponent(loginValue)}&code=${encodeURIComponent(code)}`);
      const vData = await vRes.json();
      
      if (vData.success) {
        // 🔑 СОХРАНЯЕМ СЕССИЮ ПРАВИЛЬНО
        setCurrentUser(loginData.user);
        showEquipment();
      } else {
        alert('Ошибка: ' + vData.error);
        showLoginForm();
      }
    });
    
  } catch (err) {
    alert('Ошибка: ' + err.message);
    showLoginForm();
  }
}

// Запуск
showLoginForm();
