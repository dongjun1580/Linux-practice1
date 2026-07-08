// 메뉴 목록 스크립트
const menuItems = [
    { id: 1, name: '아메리카노', price: 4000 },
    { id: 2, name: '카페라떼', price: 4500 },
    { id: 3, name: '딸기 스무디', price: 5500 },
];

const menuList = document.getElementById('menu-list');

menuItems.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} - ${item.price.toLocaleString()}원`;
    menuList.appendChild(listItem);
});
