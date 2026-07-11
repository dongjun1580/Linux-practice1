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
        let optionsText = '';
        if (item.options) {
            const opt = item.options;
            optionsText = `<div style="font-size:0.85em; color:#777; margin-top:4px;">
                [${opt.temp}] 사이즈: ${opt.size === 'large' ? '메가' : '기본'}, 샷 추가: ${opt.shot || 0}, 시럽: ${opt.syrup || 0}, 얼음: ${
                    opt.ice === 'normal' ? '보통' : (opt.ice === 'less' ? '적게' : (opt.ice === 'more' ? '많이' : '해당없음'))
                }
            </div>`;
        }

        row.innerHTML = `
            <div>
                <div class="item-name" style="font-weight:bold;">${item.name}</div>
                ${optionsText}
                <div class="item-qty" style="color:var(--primary-color); margin-top:4px;">x ${item.quantity}잔</div>
            </div>
        `;
        itemsContainer.appendChild(row);
    });

    document.getElementById('total-price').textContent = `₩${order.totalPrice.toLocaleString()}`;
});