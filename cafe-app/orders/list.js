document.addEventListener('DOMContentLoaded', async () => {
    // 최초 렌더링
    await renderOrderList();

    // 실시간 구독 (내 주문 상태 변경 시 자동 새로고침)
    if (window.sbClient) {
        window.sbClient
            .channel('customer-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
                console.log('내 주문 상태 변경 감지!', payload);
                renderOrderList();
            })
            .subscribe();
    }
});

async function renderOrderList() {
    const listContainer = document.getElementById('order-list');
    const cardHeader = document.querySelector('.orders-card h2');
    
    // 렌더링 전 초기화
    if (listContainer) listContainer.innerHTML = '';

    // 비회원용 로컬 ID 배열
    let myOrderIds = JSON.parse(localStorage.getItem('cafe_my_order_ids')) || [];
    
    // 로그인한 경우 userId 확인
    let userId = null;
    if (window.sbClient) {
        const { data: { session } } = await window.sbClient.auth.getSession();
        if (session?.user) {
            userId = session.user.id;
        }
    }

    let validOrders = [];

    try {
        let query = window.sbClient
            .from('orders')
            .select(`
                id,
                total_price,
                status,
                created_at,
                order_items (
                    menu_id,
                    quantity,
                    options
                )
            `)
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        } else if (myOrderIds.length > 0) {
            query = query.in('id', myOrderIds);
        } else {
            validOrders = [];
            query = null;
        }

        if (query) {
            const { data, error } = await query;
            if (error) throw error;
            validOrders = data || [];
        }
    } catch (e) {
        console.error('Failed to load orders from Supabase:', e);
    }

    if (validOrders.length === 0) {
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

    if (cardHeader) cardHeader.style.display = 'block';

    validOrders.forEach(order => {
        let dateString = '날짜 알 수 없음';
        if (order.created_at) {
            const itemDate = new Date(order.created_at);
            dateString = `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')} ${String(itemDate.getHours()).padStart(2,'0')}:${String(itemDate.getMinutes()).padStart(2,'0')}`;
        }
        
        let title = '주문 상품';
        
        let localMenus = [];
        try { localMenus = JSON.parse(localStorage.getItem('cafe_menus')) || []; } catch(e){}

        if(order.order_items && order.order_items.length > 0) {
            const firstMenuObj = localMenus.find(m => m.id === order.order_items[0].menu_id);
            title = firstMenuObj ? firstMenuObj.name : '맛있는 메뉴';
            if(order.order_items.length > 1) {
                title += ` 외 ${order.order_items.length - 1}건`;
            }
        }

        const price = order.total_price ? order.total_price.toLocaleString() : '0';

        let statusClass = 'status-preparing';
        let statusText = order.status || '준비 중';
        if (statusText === '준비 완료') statusClass = 'status-ready';
        if (statusText === '수령 완료') statusClass = 'status-ready'; // 추가 처리

        const shortId = order.id.split('-')[0];

        const card = document.createElement('div');
        card.className = 'order-item';
        card.onclick = () => window.goToOrderDetail(order.id);

        card.innerHTML = `
            <div class="order-header">
                <span>${dateString} (ord-${shortId})</span>
                <span class="order-status" style="font-weight:bold; color: ${statusText === '준비 완료' ? '#1e88e5' : 'inherit'}">${statusText}</span>
            </div>
            <div class="order-title" style="font-weight:bold; font-size:1.1rem; margin-top:8px;">${title}</div>
            <div class="order-price" style="color:var(--primary-color); margin-top:4px;">₩${price}</div>
        `;
        listContainer.appendChild(card);
    });
}

window.goToOrderDetail = function(id) {
    localStorage.setItem('cafe_current_order_id', id);
    location.href = 'detail.html';
};