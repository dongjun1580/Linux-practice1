document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('admin-orders-list');
    let orders = JSON.parse(localStorage.getItem('cafe_orders')) || [];
    
    // 최신 주문순
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">아직 접수된 고객 주문이 없습니다.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const itemDate = new Date(order.date);
        const dateString = `${String(itemDate.getMonth()+1).padStart(2,'0')}/${String(itemDate.getDate()).padStart(2,'0')} ${String(itemDate.getHours()).padStart(2,'0')}:${String(itemDate.getMinutes()).padStart(2,'0')}`;
        
        let title = '';
        if(order.items && order.items.length > 0) {
            title = order.items[0].name;
            if(order.items.length > 1) title += ` 외 ${order.items.length - 1}건`;
        }

        const tr = document.createElement('tr');
        
        // 상태 뱃지 클래스 부여
        let statusClass = 'status-preparing';
        let statusText = order.status || '준비 중';
        if(statusText === '준비 완료') statusClass = 'status-ready';
        if(statusText === '수령 완료') statusClass = 'status-complete';

        tr.innerHTML = `
            <td>${dateString}</td>
            <td style="font-size:0.9rem; color:#888;">${order.id}</td>
            <td style="font-weight:bold;">${title}</td>
            <td>₩${order.totalPrice.toLocaleString()}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td><button class="btn-view" onclick="location.href='detail.html?id=${order.id}'">관리</button></td>
        `;
        tbody.appendChild(tr);
    });
});
