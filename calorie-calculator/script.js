'use strict';

// Получаем ссылки на элементы формы и блока результатов
const form = document.getElementById('calc-form');
const result = document.getElementById('result');

const bmrValue = document.getElementById('bmr-value');
const tdeeValue = document.getElementById('tdee-value');
const goalLoss = document.getElementById('goal-loss');
const goalMaintain = document.getElementById('goal-maintain');
const goalGain = document.getElementById('goal-gain');

// Правила валидации для числовых полей: допустимый диапазон и название
const FIELD_RULES = {
  age: { min: 14, max: 100, label: 'Возраст' },
  height: { min: 100, max: 250, label: 'Рост' },
  weight: { min: 30, max: 300, label: 'Вес' },
};

/**
 * Проверяет одно числовое поле.
 * Возвращает число при корректном вводе либо null, если есть ошибка.
 * При ошибке подсвечивает поле и выводит сообщение.
 */
function validateField(name) {
  const rule = FIELD_RULES[name];
  const input = form.elements[name];
  const errorEl = form.querySelector(`[data-error-for="${name}"]`);

  const raw = input.value.trim();
  const value = Number(raw.replace(',', '.')); // поддержка запятой как разделителя

  let message = '';

  if (raw === '') {
    message = `Укажите значение «${rule.label}».`;
  } else if (Number.isNaN(value)) {
    message = 'Введите число.';
  } else if (value < rule.min || value > rule.max) {
    message = `Допустимый диапазон: от ${rule.min} до ${rule.max}.`;
  }

  if (message) {
    input.classList.add('invalid');
    errorEl.textContent = message;
    return null;
  }

  input.classList.remove('invalid');
  errorEl.textContent = '';
  return value;
}

/**
 * Рассчитывает базовый обмен веществ (BMR)
 * по формуле Миффлина — Сан-Жеора.
 * Мужчины:  10*вес + 6.25*рост − 5*возраст + 5
 * Женщины:  10*вес + 6.25*рост − 5*возраст − 161
 */
function calculateBMR({ gender, weight, height, age }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

// Округляем до целого числа калорий
function round(value) {
  return Math.round(value);
}

// Обработка отправки формы
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Валидируем все поля (без короткого замыкания, чтобы показать все ошибки сразу)
  const age = validateField('age');
  const height = validateField('height');
  const weight = validateField('weight');

  // Если хотя бы одно поле некорректно — прекращаем расчёт
  if (age === null || height === null || weight === null) {
    result.hidden = true;
    return;
  }

  const gender = form.elements.gender.value;
  const activity = Number(form.elements.activity.value);

  // BMR и TDEE
  const bmr = calculateBMR({ gender, weight, height, age });
  const tdee = bmr * activity;

  // Цели по калориям
  const loss = tdee * 0.8; // похудение −20%
  const gain = tdee * 1.15; // набор массы +15%

  // Выводим результаты
  bmrValue.textContent = round(bmr).toLocaleString('ru-RU');
  tdeeValue.textContent = round(tdee).toLocaleString('ru-RU');
  goalLoss.textContent = round(loss).toLocaleString('ru-RU');
  goalMaintain.textContent = round(tdee).toLocaleString('ru-RU');
  goalGain.textContent = round(gain).toLocaleString('ru-RU');

  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Скрываем результаты и очищаем ошибки при сбросе формы
form.addEventListener('reset', () => {
  result.hidden = true;
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  form.querySelectorAll('.error').forEach((el) => { el.textContent = ''; });
});

// Снимаем подсветку ошибки сразу при исправлении поля
Object.keys(FIELD_RULES).forEach((name) => {
  form.elements[name].addEventListener('input', () => {
    if (form.elements[name].classList.contains('invalid')) {
      validateField(name);
    }
  });
});
