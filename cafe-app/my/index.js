document.addEventListener('DOMContentLoaded', async () => {
    const recentList = document.getElementById('recent-orders-list');
    const recentSection = document.querySelector('.recent-orders');
    
    let ordersData = [];
    
    try {
        let userId = null;
        let myOrderIds = JSON.parse(localStorage.getItem('cafe_my_order_ids')) || [];

        if (window.sbClient) {
            const { data: { session } } = await window.sbClient.auth.getSession();
            if (session?.user) {
                userId = session.user.id;
            }
        }

        let query = window.sbClient
            .from('orders')
            .select('id, status, total_price, created_at, order_items(quantity, menus(name))')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        } else if (myOrderIds.length > 0) {
            query = query.in('id', myOrderIds);
        } else {
            // 비회원이면서 주문 번호도 없으면 빈 배열
            query = null;
        }

        if (query) {
            const { data, error } = await query;
            if (!error && data) ordersData = data;
        }
    } catch(e) {
        console.error('주문 내역 불러오기 실패:', e);
    }
    
    // 스탬프 계산 로직
    let totalItems = 0;
    ordersData.forEach(order => {
        if(order.order_items) {
            order.order_items.forEach(i => totalItems += i.quantity);
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

    if (ordersData.length === 0) {
        // 주문 내역에 없는 내용은 안 보이게 - 마이페이지에서도 빈 주문내역 영역 자체를 깔끔하게 숨김
        if (recentSection) {
            recentSection.style.display = 'none';
        }
        return;
    }

    // 최근 2건만 표시
    const topOrders = ordersData.slice(0, 2);

    topOrders.forEach(order => {
        const itemDate = order.created_at ? new Date(order.created_at) : new Date();
        const dateString = !isNaN(itemDate) ? `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')}` : '날짜 모름';
        
        let title = '주문 상품';
        if(order.order_items && order.order_items.length > 0) {
            title = order.order_items[0].menus?.name || '메뉴';
            if(order.order_items.length > 1) title += ` 외 ${order.order_items.length - 1}건`;
        }
        const price = order.total_price ? order.total_price.toLocaleString() : '0';

        const card = document.createElement('div');
        card.style.cssText = "background: white; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); transition: 0.2s;";
        card.onmouseover = () => card.style.borderColor = 'var(--primary-color)';
        card.onmouseout = () => card.style.borderColor = '#eee';
        card.onclick = () => window.goToOrderDetail(order.id);

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

window.goToOrderDetail = function(id) {
    localStorage.setItem('cafe_current_order_id', id);
    location.href = '../orders/detail.html';
};