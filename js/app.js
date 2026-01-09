// Пока просто покажем список оборудования после входа
async function showEquipment() {
  const url = `${BACKEND_URL}?action=getEquipment`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      let html = '<h2>Доступные комплекты:</h2><table border="1"><tr><th>Маркировка</th><th>Тип</th><th>Состояние</th></tr>';
      for (const item of data.equipment) {
        html += `<tr>
          <td>${item.Маркировка}</td>
          <td>${item.Тип}</td>
          <td>${item.Состояние}</td>
        </tr>`;
      }
      html += '</table>';
      document.getElementById('app').innerHTML = html;
    } else {
      document.getElementById('app').innerHTML = '<h1>Ошибка загрузки оборудования</h1>';
    }
  } catch (err) {
    document.getElementById('app').innerHTML = '<h1>Сетевая ошибка</h1>';
  }
}

// Показываем оборудование сразу (после успешного входа в реальной системе)
showEquipment();
