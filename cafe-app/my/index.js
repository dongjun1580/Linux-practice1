document.addEventListener('DOMContentLoaded', async () => {
    const recentList = document.getElementById('recent-orders-list');
    const recentSection = document.querySelector('.recent-orders');
    
    let ordersData = [];
    let userId = null;
    
    try {
        let myOrderIds = JSON.parse(localStorage.getItem('cafe_my_order_ids')) || [];
        // 예전 버전의 'order-123' 같은 잘못된 형식을 걸러내고 순수 UUID만 남깁니다 (Supabase 에러 방지)
        myOrderIds = myOrderIds.filter(id => typeof id === 'string' && id.length === 36 && id.includes('-'));

        if (window.sbClient) {
            const { data: { session } } = await window.sbClient.auth.getSession();
            if (session?.user) {
                userId = session.user.id;
            }
        }

        let query = window.sbClient
            .from('orders')
            .select('id, status, total_price, created_at, order_items(quantity, menu_id)')
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
            if (error) {
                console.error("주문 내역 에러:", error);
                document.querySelector('.recent-orders').insertAdjacentHTML('beforebegin', `<div style="color:red; background:#ffebee; padding:10px; border-radius:5px; margin-bottom:15px;">스탬프 로드 실패: ${error.message}</div>`);
            }
            if (!error && data) ordersData = data;
        }
    } catch(e) {
        console.error('주문 내역 불러오기 실패:', e);
        document.querySelector('.recent-orders').insertAdjacentHTML('beforebegin', `<div style="color:red; background:#ffebee; padding:10px; border-radius:5px; margin-bottom:15px;">스탬프 로드 실패: ${e.message}</div>`);
    }
    
    // 스탬프 및 쿠폰 계산 로직 (Supabase DB 연동)
    let stamps = 0;
    let availableCoupons = [];

    if (userId) {
        // 1. 프로필에서 스탬프 가져오기
        const { data: profile } = await window.sbClient
            .from('profiles')
            .select('stamps')
            .eq('id', userId)
            .single();
        if (profile) {
            stamps = profile.stamps;
        }

        // 2. 사용 가능한 쿠폰 가져오기
        const { data: coupons } = await window.sbClient
            .from('coupons')
            .select('*')
            .eq('user_id', userId)
            .eq('is_used', false);
        if (coupons) {
            availableCoupons = coupons;
        }
    } else {
        // 비회원(로컬 스토리지 사용자) 호환성 유지
        let totalItems = 0;
        ordersData.forEach(order => {
            if(order.order_items) {
                order.order_items.forEach(i => totalItems += i.quantity);
            }
        });
        const usedCouponsLocal = parseInt(localStorage.getItem('cafe_used_coupons') || '0');
        const totalCouponsLocal = Math.floor(totalItems / 10);
        const availableCount = totalCouponsLocal - usedCouponsLocal;
        stamps = totalItems % 10;
        if (availableCount > 0) {
            availableCoupons = Array(availableCount).fill({ id: 'local', name: '아메리카노 1잔 무료 쿠폰' });
        }
    }
    
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
    
    if (availableCoupons.length > 0) {
        document.querySelector('.stamp-notice').innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:var(--primary-color); font-weight:bold;">🎉 사용 가능한 쿠폰이 ${availableCoupons.length}장 있습니다!</span>
                <button id="btn-use-coupon" style="background:var(--primary-color); color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">쿠폰 사용</button>
            </div>
        `;

        document.getElementById('btn-use-coupon').addEventListener('click', async () => {
            if (confirm('무료 쿠폰 1장을 사용하시겠습니까? (장바구니에 담깁니다)')) {
                
                // 로그인된 유저면 실제 DB 쿠폰 사용 처리
                if (userId && availableCoupons[0].id !== 'local') {
                    const targetCouponId = availableCoupons[0].id;
                    const { error } = await window.sbClient
                        .from('coupons')
                        .update({ is_used: true, used_at: new Date().toISOString() })
                        .eq('id', targetCouponId);
                    
                    if (error) {
                        alert('쿠폰 사용 처리 중 오류가 발생했습니다: ' + error.message);
                        return;
                    }
                } else {
                    // 비회원 로컬 처리
                    const used = parseInt(localStorage.getItem('cafe_used_coupons') || '0');
                    localStorage.setItem('cafe_used_coupons', used + 1);
                }
                
                let menuId = '1';
                let menuName = '아메리카노 (쿠폰)';
                
                // 실제 DB에서 아메리카노 메뉴 가져오기
                if (window.sbClient) {
                    const { data: americano } = await window.sbClient
                        .from('menus')
                        .select('id, name')
                        .like('name', '%아메리카노%')
                        .limit(1);
                        
                    if (americano && americano.length > 0) {
                        menuId = americano[0].id;
                        menuName = americano[0].name + ' (쿠폰)';
                    } else {
                        const { data: anyMenu } = await window.sbClient
                            .from('menus')
                            .select('id, name')
                            .limit(1);
                        if (anyMenu && anyMenu.length > 0) {
                            menuId = anyMenu[0].id;
                            menuName = anyMenu[0].name + ' (무료 쿠폰)';
                        }
                    }
                }

                // 장바구니에 무료 음료 담기
                let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
                basket.push({
                    id: menuId, 
                    name: menuName,
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

    // 로컬 스토리지에서 메뉴 이름 찾기용 데이터 가져오기
    let localMenus = [];
    try {
        localMenus = JSON.parse(localStorage.getItem('cafe_menus')) || [];
    } catch(e) {}

    topOrders.forEach(order => {
        const itemDate = order.created_at ? new Date(order.created_at) : new Date();
        const dateString = !isNaN(itemDate) ? `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')}` : '날짜 모름';
        
        let title = '주문 상품';
        if(order.order_items && order.order_items.length > 0) {
            const firstMenuId = order.order_items[0].menu_id;
            const menuObj = localMenus.find(m => m.id === firstMenuId);
            title = menuObj ? menuObj.name : '맛있는 메뉴';
            
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