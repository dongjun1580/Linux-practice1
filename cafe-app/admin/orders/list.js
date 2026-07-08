// 주문 목록 스크립트
const orders = [
    { id: 1, customer: '홍길동', date: '2026-07-01', total: 15000 },
    { id: 2, customer: '김철수', date: '2026-07-02', total: 20000 },
    { id: 3, customer: '이영희', date: '2026-07-03', total: 25000 },
];
<!DOCTYPE html>
const orderListBody = document.querySelector('#order-list tbody');

orders.forEach(order => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td>${order.date}</td>
        <td>${order.total.toLocaleString()}원</td>
    `;
    orderListBody.appendChild(row);
});
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>주문 목록</title>
    <link rel="stylesheet" href="list.css">
</head>
<body>
    <h1>주문 목록</h1>
    <table id="order-list">
        <thead>
            <tr>
                <th>주문 번호</th>
                <th>고객 이름</th>
                <th>주문 날짜</th>
                <th>총 금액</th>
            </tr>
        </thead>
        <tbody>
            <!-- 주문 데이터가 여기에 추가됩니다 -->
        </tbody>
    </table>
    <script src="list.js"></script>
</body>
</html>

