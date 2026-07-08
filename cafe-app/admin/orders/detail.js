// 주문 상세 스크립트
const orderDetail = {
    id: 1,
    customer: '홍길동',
    date: '2026-07-01',
    total: 15000,
    items: [
        { name: '아메리카노', price: 4000 },
        { name: '카페라떼', price: 4500 },
        { name: '딸기 스무디', price: 5500 },
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('order-id').textContent = orderDetail.id;
    document.getElementById('customer-name').textContent = orderDetail.customer;
    document.getElementById('order-date').textContent = orderDetail.date;
    document.getElementById('total-amount').textContent = `${orderDetail.total.toLocaleString()}원`;

    const orderItemsList = document.getElementById('order-items');
    orderDetail.items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - ${item.price.toLocaleString()}원`;
        orderItemsList.appendChild(listItem);
    });
});
