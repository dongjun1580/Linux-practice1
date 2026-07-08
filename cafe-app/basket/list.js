// 장바구니 관리 스크립트
const basketItems = [
    { id: 1, name: '아메리카노', price: 4000 },
    { id: 2, name: '카페라떼', price: 4500 },
    { id: 3, name: '딸기 스무디', price: 5500 },
];
<!DOCTYPE html>
const basketList = document.getElementById('basket-items');

basketItems.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} - ${item.price.toLocaleString()}원`;
    basketList.appendChild(listItem);
});
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>장바구니</title>
    <link rel="stylesheet" href="list.css">
</head>
<body>
    <h1>장바구니</h1>
    <ul id="basket-items">
        <!-- 장바구니 아이템이 여기에 추가됩니다 -->
    </ul>
    <script src="list.js"></script>
</body>
</html>

