document.addEventListener('DOMContentLoaded', () => {
    const orders = JSON.parse(localStorage.getItem('cafe_orders')) || [];
    const menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];

    const totalOrders = orders.length;
    let totalRevenue = 0;
    
    orders.forEach(order => {
        totalRevenue += order.totalPrice || 0;
    });

    const pendingOrders = orders.filter(o => o.status === '준비 중' || !o.status).length;

    const main = document.querySelector('main');
    if (main) {
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
});
