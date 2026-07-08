import { formatPrice } from '../js/utils.js';

// URL 파라미터에서 주문 ID를 추출하여 세부 데이터를 매칭하는 시뮬레이션
const mockOrderDetailData = {
    "20260706-001": {
        id: "20260706-001",
        statusText: "메뉴를 열심히 만들고 있어요",
        desc: "완료되면 알림을 보내드릴게요.",
        items: [
            { name: "아이스 아메리카노", count: 1, options: "디카페인 / 덜달게", price: 4500 },
            { name: "크로플", count: 1, options: "아이스크림 추가", price: 4000 }
        ],
        totalPrice: 8500
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('id') || "20260706-001"; // 기본값 지정

    const orderData = mockOrderDetailData[orderId] || mockOrderDetailData["20260706-001"];
    
    renderOrderDetail(orderData);
});

function renderOrderDetail(data) {
    document.getElementById('order-id').innerText = data.id;
    document.getElementById('order-status-text').innerText = data.statusText;
    
    const itemsContainer = document.getElementById('order-items-list');
    itemsContainer.innerHTML = '';

    data.items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <div>
                <div><strong>${item.name}</strong> x ${item.count}개</div>
                <div class="item-options">${item.options}</div>
            </div>
            <div>${formatPrice(item.price * item.count)}</div>
        `;
        itemsContainer.appendChild(itemRow);
    });

    document.getElementById('sub-price').innerText = formatPrice(data.totalPrice);
    document.getElementById('total-price').innerText = formatPrice(data.totalPrice);
}