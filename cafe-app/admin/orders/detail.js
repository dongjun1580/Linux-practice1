document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('id');

    if (!orderId) {
        alert('잘못된 접근입니다.');
        location.href = 'list.html';
        return;
    }

    try {
        // 1. 주문 기본 정보 가져오기
        const { data: order, error: orderError } = await window.sbClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            alert('주문 내역을 찾을 수 없습니다.');
            location.href = 'list.html';
            return;
        }

        // 2. 주문 상세 내역(메뉴들) 가져오기
        const { data: items, error: itemsError } = await window.sbClient
            .from('order_items')
            .select('quantity, menu_id, options')
            .eq('order_id', orderId);

        // 로컬에서 메뉴 이름 매핑 (메뉴는 아직 로컬스토리지에 있음)
        let localMenus = [];
        try { localMenus = JSON.parse(localStorage.getItem('cafe_menus')) || []; } catch(e){}

        const itemDate = new Date(order.created_at);
        document.getElementById('order-id').textContent = order.id.split('-')[0]; // 너무 길면 앞부분만
        document.getElementById('order-date').textContent = itemDate.toLocaleString();
        
        const itemsContainer = document.getElementById('order-items-list');
        itemsContainer.innerHTML = '';
        
        if (items && items.length > 0) {
            items.forEach(item => {
                const menuObj = localMenus.find(m => m.id === item.menu_id);
                const menuName = menuObj ? menuObj.name : '맛있는 메뉴';
                const row = document.createElement('li');
                row.className = 'item-row';
                row.innerHTML = `<span>${menuName} <span class="item-qty">x ${item.quantity}잔</span></span>`;
                itemsContainer.appendChild(row);
            });
        }

        document.getElementById('total-price').textContent = `₩${order.total_price.toLocaleString()}`;

        // 상태 변경 제어 로직
        const currentStatus = order.status || '준비 중';
        const statusBtns = document.querySelectorAll('.status-btn');
        
        statusBtns.forEach(btn => {
            if(btn.dataset.status === currentStatus) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', async () => {
                const newStatus = btn.dataset.status;
                
                if(confirm(`해당 주문 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
                    // Supabase 업데이트
                    const { error: updateError } = await window.sbClient
                        .from('orders')
                        .update({ status: newStatus })
                        .eq('id', orderId);
                        
                    if (updateError) {
                        console.error('상태 업데이트 실패:', updateError);
                        alert('상태 업데이트에 실패했습니다.');
                        return;
                    }
                    
                    // 버튼 시각적 활성화 변경
                    statusBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    alert('주문 상태가 성공적으로 변경되었습니다!');
                }
            });
        });
    } catch (e) {
        console.error("주문 상세 불러오기 에러:", e);
        alert('주문 정보를 불러오는 중 에러가 발생했습니다.');
    }
});
