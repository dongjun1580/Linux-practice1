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

    // 스탬프 계산 로직
    let totalItems = 0;
    validOrders.forEach(order => {
        if(order.items) {
            order.items.forEach(i => totalItems += i.quantity);
        }
    });
    
    const usedCoupons = parseInt(localStorage.getItem('cafe_used_coupons') || '0');
    const totalCoupons = Math.floor(totalItems / 10);
    const availableCoupons = totalCoupons - usedCoupons;
    
    // 남은 스탬프는 총 아이템 수에서 (총 쿠폰 수 * 10)을 뺀 나머지
    const stamps = totalItems % 10;
    
    document.getElementById('current-stamps').textContent = stamps;
    const stampGrid = document.getElementById('stamp-grid');
    if (stampGrid) {
        for(let i=0; i<10; i++) {
            const circle = document.createElement('div');
            circle.className = `stamp-circle ${i < stamps ? 'active' : ''}`;
            circle.innerHTML = i < stamps ? '☕' : '';
            stampGrid.appendChild(circle);
        }
    }
    
    if (availableCoupons > 0) {
        document.querySelector('.stamp-notice').innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:var(--primary-color); font-weight:bold;">🎉 사용 가능한 무료 쿠폰이 ${availableCoupons}장 있습니다!</span>
                <button id="btn-use-coupon" style="background:var(--primary-color); color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">쿠폰 사용</button>
            </div>
        `;

        document.getElementById('btn-use-coupon').addEventListener('click', () => {
            if (confirm('무료 아메리카노 쿠폰을 사용하시겠습니까? (장바구니에 담깁니다)')) {
                // 사용한 쿠폰 수 증가
                localStorage.setItem('cafe_used_coupons', usedCoupons + 1);
                
                // 장바구니에 무료 아메리카노 담기
                let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
                basket.push({
                    id: '1', // 보통 아메리카노 ID가 1번이라고 가정
                    name: '아메리카노 (쿠폰)',
                    price: 0,
                    basePrice: 0,
                    options: { temp: 'ICED', size: 'regular', shot: 0, syrup: 0, ice: 'normal' },
                    quantity: 1
                });
                localStorage.setItem('cafe_basket', JSON.stringify(basket));
                
                alert('무료 쿠폰 아메리카노가 장바구니에 담겼습니다! 장바구니로 이동합니다.');
                location.href = '../basket/list.html';
            }
        });
    } else {
        document.querySelector('.stamp-notice').innerHTML = '스탬프 10개를 모으면 무료 음료 쿠폰이 발행됩니다!';
    }

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