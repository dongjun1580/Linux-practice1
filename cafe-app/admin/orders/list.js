document.addEventListener('DOMContentLoaded', () => {
    renderOrders();

    // 실시간(Realtime) 구독 시작! (새 주문이 들어오거나 상태가 변하면 자동 새로고침)
    window.sbClient
        .channel('kds-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
            console.log('KDS 주문 변경 감지!', payload);
            renderOrders();
        })
        .subscribe();
});

async function renderOrders() {
    const tbody = document.getElementById('admin-orders-list');
    
    try {
        // --- 관리자 권한 체크 시작 ---
        const { data: { session } } = await window.sbClient.auth.getSession();
        
        if (!session) {
            alert('접근 권한이 없습니다. 먼저 로그인해주세요.');
            location.href = '../../index.html';
            return;
        }

        // DB의 profiles 테이블에서 is_admin 여부 확인
        const { data: profile } = await window.sbClient
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
        
        if (!profile || profile.is_admin !== true) {
            alert(`접근 권한 거부: 현재 계정(${session.user.email})은 사장님(관리자) 권한이 없습니다.`);
            location.href = '../../index.html';
            return;
        }
        // --- 관리자 권한 체크 끝 ---

        // Supabase에서 주문 내역과 함께 연관된 상세 아이템(메뉴 이름 포함)까지 한 번에 가져오기
        const { data: orders, error } = await window.sbClient
            .from('orders')
            .select(`
                id,
                user_name,
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

        if (error) throw error;

        // 총 매출 계산 (전체 주문 대상)
        let totalRevenue = 0;
        orders.forEach(o => totalRevenue += o.total_price);
        
        const revEl = document.getElementById('total-revenue');
        if (revEl) {
            revEl.textContent = `₩${totalRevenue.toLocaleString()}`;
        }

        // '수령 완료'되지 않은 진행 중인 주문만 필터링 (최대 10개 제한)
        let activeOrders = orders.filter(o => o.status !== '수령 완료');
        activeOrders = activeOrders.slice(0, 10);

        tbody.innerHTML = '';

        if (activeOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-msg" style="padding:40px; text-align:center;">현재 진행 중인 고객 주문이 없습니다. 🎉</td></tr>';
            return;
        }

        // 로컬 메뉴 매핑
        let localMenus = [];
        try { localMenus = JSON.parse(localStorage.getItem('cafe_menus')) || []; } catch(e){}

        activeOrders.forEach(order => {
            const itemDate = new Date(order.created_at);
            const dateString = `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')} ${String(itemDate.getHours()).padStart(2,'0')}:${String(itemDate.getMinutes()).padStart(2,'0')}`;
            
            const shortId = order.id.split('-')[0];
            
            let title = '';
            if (order.order_items && order.order_items.length > 0) {
                const firstMenuObj = localMenus.find(m => m.id === order.order_items[0].menu_id);
                const firstMenuName = firstMenuObj ? firstMenuObj.name : '맛있는 메뉴';
                title = firstMenuName;
                if(order.order_items.length > 1) {
                    title += ` 외 ${order.order_items.length - 1}건`;
                }
            }

            const tr = document.createElement('tr');
            
            // 상태 뱃지 클래스 및 동적 버튼 생성
            let statusClass = 'status-preparing';
            let statusText = order.status || '준비 중';
            let actionBtn = `<button class="btn-view" style="background:#43a047; color:white; border:none; padding:6px 10px; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="updateOrderStatus('${order.id}', '준비 완료')">✔️ 제조 완료</button>`;

            if(statusText === '준비 완료') {
                statusClass = 'status-ready';
                actionBtn = `<button class="btn-view" style="background:#1e88e5; color:white; border:none; padding:6px 10px; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="updateOrderStatus('${order.id}', '수령 완료')">🛎️ 수령 완료</button>`;
            }



            tr.innerHTML = `
                <td>${dateString}</td>
                <td style="font-size:0.9rem; color:#888;">ord-${shortId}</td>
                <td style="font-weight:bold; color:var(--primary-color); font-size:1.1rem;">${order.user_name || '비회원'}</td>
                <td style="font-weight:bold;">${title}</td>
                <td>₩${order.total_price.toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}" style="font-size:0.85rem; padding:6px 10px;">${statusText}</span></td>
                <td>${actionBtn}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("주문 목록을 가져오는 중 오류 발생:", error);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-msg" style="padding:40px; text-align:center; color:red;">주문 목록을 불러오지 못했습니다.</td></tr>';
    }
}

// 주문 상태 변경 전역 함수
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const { error } = await window.sbClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
            
        if (error) throw error;
        
        renderOrders(); // 상태 변경 후 즉시 화면 새로고침
    } catch (error) {
        console.error("주문 상태 변경 중 오류 발생:", error);
        alert("상태를 변경하지 못했습니다.");
    }
};
