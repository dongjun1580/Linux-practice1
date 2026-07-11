document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('order-list');
    const cardHeader = document.querySelector('.orders-card h2');
    
    let orders = [];
    try {
        const parsed = JSON.parse(localStorage.getItem('cafe_orders'));
        if(Array.isArray(parsed)) orders = parsed;
    } catch(e) {
        console.error('Failed to parse orders:', e);
    }
    
    // 유효한 데이터만 필터링하고 정렬
    const validOrders = orders.filter(o => o && o.id);
    
    validOrders.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    if (validOrders.length === 0) {
        // 주문 내역이 없을 경우, 껍데기(H2 제목 등)를 안 보이게 깔끔하게 숨기고 안내 메시지만 띄움
        if (cardHeader) cardHeader.style.display = 'none';
        
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 40px 0;">
                <div style="font-size:3.5rem; margin-bottom:20px;">🧾</div>
                <h3 style="color:var(--text-main); margin-bottom:12px; font-size:1.3rem;">아직 주문하신 내역이 없습니다.</h3>
                <p style="color:var(--text-muted); margin-bottom:30px; line-height:1.6;">맛있는 커피와 디저트가 고객님을 기다리고 있어요!<br>지금 바로 둘러보실까요?</p>
                <button onclick="location.href='../menus/list.html'" style="padding:12px 28px; background:var(--primary-color); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.05rem; box-shadow:0 4px 10px rgba(141,110,99,0.3); transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">☕ 메뉴 둘러보기</button>
            </div>
        `;
        return;
    }

    validOrders.forEach(order => {
        let dateString = '날짜 알 수 없음';
        if (order.date) {
            const itemDate = new Date(order.date);
            if(!isNaN(itemDate.getTime())) {
                dateString = `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')} ${String(itemDate.getHours()).padStart(2,'0')}:${String(itemDate.getMinutes()).padStart(2,'0')}`;
            }
        }
        
        let title = '주문 상품';
        if(order.items && order.items.length > 0) {
            title = order.items[0].name;
            if(order.items.length > 1) {
                title += ` 외 ${order.items.length - 1}건`;
            }
        }

        const price = order.totalPrice ? order.totalPrice.toLocaleString() : '0';

        const card = document.createElement('div');
        card.className = 'order-item';
        card.onclick = () => window.goToOrderDetail(order.id);

        card.innerHTML = `
            <div class="order-header">
                <span>${dateString}</span>
                <span class="order-status">${order.status || '준비 중'}</span>
            </div>
            <div class="order-title">${title}</div>
            <div class="order-price">₩${price}</div>
        `;
        listContainer.appendChild(card);
    });
});

window.goToOrderDetail = function(id) {
    localStorage.setItem('cafe_current_order_id', id);
    location.href = 'detail.html';
};