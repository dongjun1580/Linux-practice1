document.addEventListener('DOMContentLoaded', () => {
    const recentList = document.getElementById('recent-orders-list');
    const recentSection = document.querySelector('.recent-orders');
    
    let orders = [];
    try {
        const parsed = JSON.parse(localStorage.getItem('cafe_orders'));
        if(Array.isArray(parsed)) orders = parsed;
    } catch(e) {}
    
    const validOrders = orders.filter(o => o && o.id);
    validOrders.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    if (validOrders.length === 0) {
        // 주문 내역에 없는 내용은 안 보이게 - 마이페이지에서도 빈 주문내역 영역 자체를 깔끔하게 숨김
        if (recentSection) {
            recentSection.style.display = 'none';
        }
        return;
    }

    // 최근 2건만 표시
    const topOrders = validOrders.slice(0, 2);

    topOrders.forEach(order => {
        const itemDate = order.date ? new Date(order.date) : new Date();
        const dateString = !isNaN(itemDate) ? `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')}` : '날짜 모름';
        
        let title = '주문 상품';
        if(order.items && order.items.length > 0) {
            title = order.items[0].name;
            if(order.items.length > 1) title += ` 외 ${order.items.length - 1}건`;
        }
        const price = order.totalPrice ? order.totalPrice.toLocaleString() : '0';

        const card = document.createElement('div');
        card.style.cssText = "background: white; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); transition: 0.2s;";
        card.onmouseover = () => card.style.borderColor = 'var(--primary-color)';
        card.onmouseout = () => card.style.borderColor = '#eee';
        card.onclick = () => location.href = `../orders/detail.html?id=${order.id}`;

        card.innerHTML = `
            <div>
                <div style="font-size: 0.85rem; color: #888; margin-bottom: 5px;">${dateString} | <strong style="color: #E65100;">${order.status || '준비 중'}</strong></div>
                <div style="font-weight: bold; font-size: 1.1rem; color: #3E2723;">${title}</div>
            </div>
            <div style="font-weight: bold; color: #8D6E63; font-size: 1.1rem;">₩${price}</div>
        `;
        recentList.appendChild(card);
    });
});