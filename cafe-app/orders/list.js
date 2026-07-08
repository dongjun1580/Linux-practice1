import { formatPrice } from '../js/utils.js';

// 임시 주문 데이터 (원래는 로컬스토리지나 API를 통해 가져옵니다)
const mockOrders = [
    {
        id: "20260706-001",
        date: "2026.07.06 15:30",
        status: "preparing",
        statusText: "메뉴 준비 중",
        itemsSummary: "아이스 아메리카노 외 1건",
        totalPrice: 8500
    },
    {
        id: "20260705-042",
        date: "2026.07.05 12:15",
        status: "ready",
        statusText: "준비 완료",
        itemsSummary: "따뜻한 카페라떼",
        totalPrice: 5000
    },
    {
        id: "20260701-015",
        date: "2026.07.01 09:05",
        status: "complete",
        statusText: "수령 완료",
        itemsSummary: "딸기 스무디 외 2건",
        totalPrice: 16500
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderOrderList(mockOrders);
});

function renderOrderList(orders) {
    const listContainer = document.getElementById('order-list');
    listContainer.innerHTML = '';

    if (orders.length === 0) {
        listContainer.innerHTML = '<p class="empty-msg">주문 내역이 없습니다.</p>';
        return;
    }

    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.onclick = () => {
            // 상세 페이지로 주문 ID를 가지고 이동
            location.href = `detail.html?id=${order.id}`;
        };

        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-date">${order.date}</span>
                <span class="order-status status-${order.status}">${order.statusText}</span>
            </div>
            <div class="order-summary">${order.itemsSummary}</div>
            <div class="order-price">${formatPrice(order.totalPrice)}</div>
        `;

        listContainer.appendChild(card);
    });
}