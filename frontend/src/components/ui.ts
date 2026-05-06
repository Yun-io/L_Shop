/**
 * Варианты стилей для кнопок
 */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

/**
 * Создает HTML-строку стандартизированной кнопки.
 * Используется для предотвращения дублирования HTML-кода кнопок.
 * 
 * @param {string} text - Текст на кнопке.
 * @param {ButtonVariant} [variant='primary'] - Цветовая схема кнопки.
 * @param {string} [onClickAction] - JS код, который выполнится при клике (например, 'window.addToCart(1)').
 * @param {string} [extraClasses=''] - Дополнительные CSS классы (например, 'w-100').
 * @returns {string} Готовая HTML строка кнопки.
 */
export const createButton = (
  text: string, 
  variant: ButtonVariant = 'primary', 
  onClickAction?: string,
  extraClasses: string = ''
): string => {
  const clickAttr = onClickAction ? `onclick="${onClickAction}"` : '';
  return `<button class="btn btn-${variant} ${extraClasses}" ${clickAttr}>${text}</button>`;
};