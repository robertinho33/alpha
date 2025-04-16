// eco/ui/render.js
export function renderList(elementId, items, renderItem) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Elemento com id ${elementId} não encontrado`);
    return;
  }
  element.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = renderItem(item);
    element.appendChild(li);
  });
}

// src/ui/render.js
export function renderSelect(id, items, valueMapper, textMapper) {
  const select = document.getElementById(id);
  if (!select) {
    console.error(`Elemento com id ${id} não encontrado`);
    return;
  }
  select.innerHTML = '<option value="">Selecione...</option>';
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = valueMapper ? valueMapper(item) : item;
    option.textContent = textMapper ? textMapper(item) : item;
    select.appendChild(option);
    console.log(`Adicionando option em ${id}:`, { value: option.value, text: option.textContent }); // Log 7: cada option
  });
}