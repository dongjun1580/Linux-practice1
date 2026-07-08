// 공통 유틸리티

/**
 * 가격을 통화 형식으로 변환
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}
/* 전역 CSS 변수 */
/**
 * 카트에 아이템 추가
 * @param {Array} cart
 * @param {Object} item
 * @returns {Array}
 */
function addToCart(cart, item) {
  return [...cart, item];
}

export { formatPrice, addToCart };
:root {
  --primary-color: #6b4f4f;
  --secondary-color: #f5f5dc;
  --font-family: 'Arial', sans-serif;
  --font-size-base: 16px;
}

/* 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
