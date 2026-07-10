document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('id');

    if (!orderId) {
        alert('잘못된 접근입니다.');
        location.href = 'list.html';
        return;
    }

    const orders = JSON.parse(localStorage.getItem('cafe_orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        alert('주문 내역을 찾을 수 없습니다.');
        location.href = 'list.html';
        return;
    }

    const itemDate = new Date(order.date);
    const dateString = `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')} ${String(itemDate.getHours()).padStart(2,'0')}:${String(itemDate.getMinutes()).padStart(2,'0')}`;

    document.getElementById('order-id').textContent = order.id;
    document.getElementById('order-date').textContent = dateString;
    document.getElementById('order-status').textContent = order.status || '준비 중';
    
    const itemsContainer = document.getElementById('order-items-list');
    
    order.items.forEach(item => {
        const row = document.createElement('li');
        row.className = 'item-row';
        row.innerHTML = `
            <div>
                <span class="item-name">${item.name}</span>
                <span class="item-qty">x ${item.quantity}잔</span>
            </div>
        `;
        itemsContainer.appendChild(row);
    });

    document.getElementById('total-price').textContent = `₩${order.totalPrice.toLocaleString()}`;
});