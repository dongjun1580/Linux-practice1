// 메뉴 상세 스크립트
const menuDetail = {
    name: '아메리카노',
    price: 4000,
    description: '진한 에스프레소에 뜨거운 물을 더한 커피',
};
<!DOCTYPE html>
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menu-name').textContent = menuDetail.name;
    document.getElementById('menu-price').textContent = `${menuDetail.price.toLocaleString()}원`;
    document.getElementById('menu-description').textContent = menuDetail.description;
});
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>메뉴 목록</title>
    <link rel="stylesheet" href="list.css">
</head>
<body>
    <h1>메뉴 목록</h1>
    <ul id="menu-list">
        <!-- 메뉴 아이템이 여기에 추가됩니다 -->
    </ul>
    <script src="list.js"></script>
</body>
</html>

