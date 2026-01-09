let currentEquipment = null;

function showEquipment() {
  const url = `${BACKEND_URL}?action=getEquipment`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        let html = '<h2>Доступные комплекты:</h2><table border="1"><tr><th>Маркировка</th><th>Тип</th><th>Состояние</th><th>Действие</th></tr>';
        for (const item of data.equipment) {
          if (item.Состояние === 'Свободен') {
            html += `<tr>
              <td>${item.Маркировка}</td>
              <td>${item.Тип}</td>
              <td>${item.Состояние}</td>
              <td><button onclick="showContractForm('${item.Маркировка}')">Создать договор</button></td>
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
      <label>ФИО арендатора:<br><input type="text" id="fullName" required></label><br><br>
      <label>Паспорт (серия номер):<br><input type="text" id="passport" required></label><br><br>
      <label>Дата выдачи (ГГГГ-ММ-ДД):<br><input type="date" id="issueDate" required></label><br><br>
      <label>Срок аренды (дней):<br><input type="number" id="duration" min="1" value="7" required></label><br><br>
      <button type="submit">Сохранить договор</button>
      <button type="button" onclick="showEquipment()">Назад</button>
    </form>
  `;
  document.getElementById('app').innerHTML = html;

  document.getElementById('contractForm').addEventListener('submit', createContract);
}

function createContract(e) {
  e.preventDefault();
  
  const url = `${BACKEND_URL}?action=saveContract` +
    `&equipment=${encodeURIComponent(currentEquipment)}` +
    `&fullName=${encodeURIComponent(document.getElementById('fullName').value)}` +
    `&passport=${encodeURIComponent(document.getElementById('passport').value)}` +
    `&issueDate=${encodeURIComponent(document.getElementById('issueDate').value)}` +
    `&duration=${encodeURIComponent(document.getElementById('duration').value)}`;

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

// Запуск
showEquipment();
