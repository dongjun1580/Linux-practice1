document.addEventListener('DOMContentLoaded', async () => {
    try {
        // --- 관리자 권한 체크 시작 ---
        const { data: { session } } = await window.sbClient.auth.getSession();
        
        if (!session) {
            alert('접근 권한이 없습니다. 먼저 로그인해주세요.');
            location.href = '../index.html';
            return;
        }

        // DB의 profiles 테이블에서 role 권한 확인
        const { data: profile } = await window.sbClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        
        if (!profile || profile.role !== 'admin') {
            alert(`접근 권한 거부: 현재 계정(${session.user.email})은 사장님(관리자) 권한이 없습니다.`);
            location.href = '../index.html';
            return;
        }
        // --- 관리자 권한 체크 끝 ---

        // 화면 렌더링 함수
        async function renderDashboard() {
            // 1. 주문 데이터 가져오기
            const { data: orders, error: ordersError } = await window.sbClient
                .from('orders')
                .select('status, total_price');
                
            if (ordersError) throw ordersError;

            // 2. 메뉴 데이터 가져오기 (메뉴 개수용)
            const { data: menus, error: menusError } = await window.sbClient
                .from('menus')
                .select('id');

            if (menusError) throw menusError;

            const totalOrders = orders.length;
            let totalRevenue = 0;
            
            orders.forEach(order => {
                totalRevenue += order.total_price || 0;
            });

            const pendingOrders = orders.filter(o => o.status === '준비 중' || !o.status).length;

            const main = document.querySelector('main');
            if (main) {
                // 기존 대시보드가 있으면 삭제 (재렌더링 위해)
                const existingGrid = document.querySelector('.dashboard-grid');
                if (existingGrid) existingGrid.remove();

                const dashboardHTML = `
                    <div class="dashboard-grid">
                        <div class="stat-card">
                            <h3>누적 주문 수</h3>
                            <strong>${totalOrders}건</strong>
                        </div>
                        <div class="stat-card">
                            <h3>누적 매출액</h3>
                            <strong>₩${totalRevenue.toLocaleString()}</strong>
                        </div>
                        <div class="stat-card">
                            <h3>등록된 메뉴</h3>
                            <strong>${menus.length}개</strong>
                        </div>
                        <div class="stat-card">
                            <h3>대기 중인 주문</h3>
                            <strong style="color:#E65100;">${pendingOrders}건</strong>
                        </div>
                    </div>
                `;
                main.insertAdjacentHTML('beforeend', dashboardHTML);
            }
        }

        // 최초 1회 렌더링
        await renderDashboard();

        // 3. 실시간(Realtime) 구독 시작!
        window.sbClient
            .channel('dashboard-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
                console.log('주문 상태 변경 감지!', payload);
                renderDashboard(); // 누군가 주문하거나 상태가 바뀌면 화면 즉시 새로고침!
            })
            .subscribe();

    } catch (error) {
        console.error("대시보드 데이터를 불러오는 중 오류 발생:", error);
        const main = document.querySelector('main');
        if (main) {
            main.insertAdjacentHTML('beforeend', `<div style="color:red; background:#ffebee; padding:20px; border-radius:8px; margin-top:20px;"><strong>앗! 화면을 그리는 중 에러가 발생했습니다:</strong><br>${error.message || JSON.stringify(error)}</div>`);
        }
    }
});
