// menus/list.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('menus-container');
    const tabs = document.querySelectorAll('.tab-btn');
    
    const defaultMenus = [
        { id: 'm1', category: 'coffee', name: '아메리카노', price: 4500, description: '최상급 원두로 내린 깔끔하고 진한 에스프레소에 시원한 물을 더한 아메리카노.', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80' },
        { id: 'm2', category: 'coffee', name: '카페라떼', price: 5000, description: '고소한 에스프레소와 부드러운 스팀 밀크의 완벽한 조화.', img: '../카페라떼.jpg' },
        { id: 'm3', category: 'coffee', name: '바닐라 라떼', price: 5500, description: '달콤한 바닐라 시럽과 에스프레소가 어우러진 기분 좋은 달콤함.', img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80' },
        { id: 'm4', category: 'coffee', name: '콜드브루', price: 5000, description: '12시간 이상 차갑게 우려내어 쓴맛이 적고 깔끔한 풍미의 커피.', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80' },
        
        { id: 'm5', category: 'beverage', name: '딸기 스무디', price: 6000, description: '상큼한 생딸기를 듬뿍 갈아 만든 시원한 스무디.', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80' },
        { id: 'm6', category: 'beverage', name: '자몽 에이드', price: 5500, description: '톡 쏘는 탄산과 쌉싸름한 자몽 청이 만난 청량감 가득한 에이드.', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80' },
        { id: 'm7', category: 'beverage', name: '밀크티', price: 5500, description: '진하게 우려낸 홍차에 부드러운 우유를 더한 클래식 밀크티.', img: '../밀크티.jpg' },
        { id: 'm8', category: 'beverage', name: '제주 녹차 라떼', price: 5500, description: '제주산 유기농 말차 가루로 만든 진하고 쌉쌀한 매력의 라떼.', img: '../녹차라떼.jpg' },

        { id: 'm9', category: 'dessert', name: '티라미수', price: 6500, description: '부드러운 레이디핑거와 진한 마스카포네 치즈의 앙상블.', img: '../티라미수.jpg' },
        { id: 'm10', category: 'dessert', name: '뉴욕 치즈 케이크', price: 6000, description: '꾸덕하고 진한 크림치즈의 풍미가 가득한 치즈 케이크.', img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80' },
        { id: 'm11', category: 'dessert', name: '크로플', price: 5000, description: '겉은 바삭하고 속은 쫄깃한 와플에 메이플 시럽을 곁들였습니다.', img: '../크로플.jpg' },
        { id: 'm12', category: 'dessert', name: '마카롱 세트', price: 7500, description: '쫀득한 꼬끄와 달콤한 필링, 베스트 맛 3가지 마카롱 세트.', img: '../마카롱.jpg' }
    ];

    // 이번에는 사진 교체를 위해 무조건 강제로 덮어쓰기
    let menus = defaultMenus;
    localStorage.setItem('cafe_menus', JSON.stringify(menus));

    function render(category = 'all') {
        container.innerHTML = '';
        const filtered = category === 'all' ? menus : menus.filter(m => m.category === category);
        
        if(filtered.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 50px 0; color:#999;">준비된 메뉴가 없습니다.</p>';
            return;
        }

        filtered.forEach(menu => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.onclick = () => location.href = `detail.html?id=${menu.id}`;
            
            const imgHTML = menu.img ? `<div style="height:180px; width:100%; border-radius:12px; margin-bottom:15px; background:url('${menu.img}') center/cover no-repeat;"></div>` : '';

            card.innerHTML = `
                ${imgHTML}
                <div class="menu-title">${menu.name}</div>
                <div class="menu-price">₩${menu.price.toLocaleString()}</div>
                <div style="color:#666; font-size:0.9rem; line-height:1.4; margin-top:8px;">${menu.description || ''}</div>
            `;
            container.appendChild(card);
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            render(e.target.dataset.category);
        });
    });

    render();
});
