document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('id') || localStorage.getItem('cafe_current_order_id');

    if (!orderId) {
        alert('잘못된 접근입니다.');
        location.href = 'list.html';
        return;
    }

    // 최초 렌더링
    await renderOrderDetail(orderId);

    // 실시간 구독
    if (window.sbClient) {
        window.sbClient
            .channel('customer-order-detail')
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'orders',
                filter: `id=eq.${orderId}`
            }, payload => {
                console.log('현재 주문의 상태 변경 감지!', payload);
                renderOrderDetail(orderId);
            })
            .subscribe();
    }
});

async function renderOrderDetail(orderId) {
    try {
        const { data: order, error } = await window.sbClient
            .from('orders')
            .select(`
                id,
                total_price,
                status,
                created_at,
                order_items (
                    quantity,
                    options,
                    menus ( name )
                )
            `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            throw error || new Error('Order not found');
        }

        const itemDate = new Date(order.created_at);
        const dateString = `${itemDate.getFullYear()}.${String(itemDate.getMonth()+1).padStart(2,'0')}.${String(itemDate.getDate()).padStart(2,'0')} ${String(itemDate.getHours()).padStart(2,'0')}:${String(itemDate.getMinutes()).padStart(2,'0')}`;

        const shortId = order.id.split('-')[0];
        document.getElementById('order-id').textContent = 'ord-' + shortId;
        document.getElementById('order-date').textContent = dateString;
        
        const statusEl = document.getElementById('order-status');
        statusEl.textContent = order.status || '준비 중';
        if (order.status === '준비 완료' || order.status === '수령 완료') {
            statusEl.style.background = '#1e88e5';
            statusEl.style.color = '#fff';
        } else {
            // 기본 상태 복구 (혹시 모를 상태 변경 대비)
            statusEl.style.background = '#ff9800';
            statusEl.style.color = '#fff';
        }
        
        const itemsContainer = document.getElementById('order-items-list');
        itemsContainer.innerHTML = ''; // 초기화
        
        if (order.order_items) {
            order.order_items.forEach(item => {
                const row = document.createElement('li');
                row.className = 'item-row';
                let optionsText = '';
                if (item.options) {
                    const opt = item.options;
                    const temp = opt.temp === '해당없음' ? '' : `[${opt.temp}]`;
                    optionsText = `<div style="font-size:0.85em; color:#777; margin-top:4px;">
                        ${temp} 사이즈: ${opt.size === 'large' ? '메가' : '기본'}, 샷 추가: ${opt.shot || 0}, 시럽: ${opt.syrup || 0}, 얼음: ${
                            opt.ice === 'normal' ? '보통' : (opt.ice === 'less' ? '적게' : (opt.ice === 'more' ? '많이' : '해당없음'))
                        }
                    </div>`;
                }

                row.innerHTML = `
                    <div>
                        <div class="item-name" style="font-weight:bold;">${item.menus?.name || '알 수 없는 메뉴'}</div>
                        ${optionsText}
                        <div class="item-qty" style="color:var(--primary-color); margin-top:4px;">x ${item.quantity}잔</div>
                    </div>
                `;
                itemsContainer.appendChild(row);
            });
        }

        document.getElementById('total-price').textContent = `₩${order.total_price.toLocaleString()}`;
    } catch (error) {
        console.error('Failed to load order detail:', error);
        alert('주문 상세 정보를 불러오지 못했습니다.');
        location.href = 'list.html';
    }
}