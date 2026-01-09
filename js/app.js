let currentEquipment = null;

function showEquipment() {
  const url = `${BACKEND_URL}?action=getEquipment`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        let html = '<h2>Оборудование:</h2><table border="1"><tr><th>Маркировка</th><th>Тип</th><th>Состояние</th><th>Действие</th></tr>';
        for (const item of data.equipment) {
          if (item.Состояние === 'Свободен') {
            html += `<tr>
              <td>${item.Маркировка}</td>
              <td>${item.Тип}</td>
              <td>${item.Состояние}</td>
              <td><button onclick="showContractForm('${item.Маркировка}')">Создать договор</button></td>
            </tr>`;
          } else if (item.Состояние === 'В аренде') {
            html += `<tr>
              <td>${item.Маркировка}</td>
              <td>${item.Тип}</td>
              <td>${item.Состояние}</td>
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
  
  // Получаем имя сотрудника (временно — можно хранить после входа)
  const createdBy = 'Админ'; // позже заменим на реального пользователя

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
        alert(`Договор ${data.contractNumber} успешно создан!`);
        showEquipment();
      } else {
        alert('Ошибка при создании договора');
      }
    })
    .catch(() => {
      alert('Сетевая ошибка');
    });
}

function returnEquipment(marking) {
  if (!confirm(`Вы уверены, что хотите вернуть комплект ${marking}?`)) return;

  const url = `${BACKEND_URL}?action=returnEquipment&marking=${encodeURIComponent(marking)}`;
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Оборудование успешно возвращено!');
        showEquipment();
      } else {
        alert('Ошибка при возврате');
      }
    })
    .catch(() => {
      alert('Сетевая ошибка');
    });
}

// Обработка формы входа
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const loginValue = document.getElementById('login').value;
  const passwordValue = document.getElementById('password').value;
  
  try {
    await login(loginValue, passwordValue); // <-- теперь функция не перезаписана
    showEquipment();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
});

// Защита функций от неавторизованного доступа
const originalShowEquipment = showEquipment;
showEquipment = function() {
  if (!getCurrentUser()) {
    document.getElementById('app').innerHTML = '<h1>Требуется вход</h1>';
    return;
  }
  originalShowEquipment();
};

// Передаём имя сотрудника в договор
const originalCreateContract = createContract;
createContract = function(e) {
  e.preventDefault();
  const createdBy = getCurrentUser()?.name || 'Неизвестно';
  // ... остальной код как у тебя, но с `createdBy`
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
        alert(`Договор ${data.contractNumber} успешно создан!`);
        showEquipment();
      } else {
        alert('Ошибка при создании договора');
      }
    })
    .catch(() => {
      alert('Сетевая ошибка');
    });
};
