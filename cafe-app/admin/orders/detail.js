document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('id');

    if (!orderId) {
        alert('잘못된 접근입니다.');
        location.href = 'list.html';
        return;
    }

    let orders = JSON.parse(localStorage.getItem('cafe_orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        alert('주문 내역을 찾을 수 없습니다.');
        location.href = 'list.html';
        return;
    }

    const order = orders[orderIndex];

    const itemDate = new Date(order.date);
    document.getElementById('order-id').textContent = order.id;
    document.getElementById('order-date').textContent = itemDate.toLocaleString();
    
    const itemsContainer = document.getElementById('order-items-list');
    order.items.forEach(item => {
        const row = document.createElement('li');
        row.className = 'item-row';
        row.innerHTML = `<span>${item.name} <span class="item-qty">x ${item.quantity}잔</span></span>`;
        itemsContainer.appendChild(row);
    });

    document.getElementById('total-price').textContent = `₩${order.totalPrice.toLocaleString()}`;

    // 상태 변경 제어 로직
    const currentStatus = order.status || '준비 중';
    const statusBtns = document.querySelectorAll('.status-btn');
    
    statusBtns.forEach(btn => {
        if(btn.dataset.status === currentStatus) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            const newStatus = btn.dataset.status;
            
            if(confirm(`해당 주문 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
                orders[orderIndex].status = newStatus;
                localStorage.setItem('cafe_orders', JSON.stringify(orders));
                
                // 버튼 시각적 활성화 변경
                statusBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                alert('주문 상태가 성공적으로 변경되었습니다!');
            }
        });
    });
});
