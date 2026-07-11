// index.js
if (!localStorage.getItem('orders_reset_done_v1')) {
    localStorage.removeItem('cafe_orders');
    localStorage.setItem('orders_reset_done_v1', 'true');
}
document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('main-menu-grid');
    const tabButtons = document.querySelectorAll('.tab-btn');

    const defaultMenus = [
        { id: 'm1', category: 'coffee', name: '아메리카노', price: 4500, description: '최상급 원두로 내린 깔끔하고 진한 에스프레소에 시원한 물을 더한 아메리카노.', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80' },
        { id: 'm2', category: 'coffee', name: '카페라떼', price: 5000, description: '고소한 에스프레소와 부드러운 스팀 밀크의 완벽한 조화.', img: './img/카페라떼.jpg' },
        { id: 'm3', category: 'coffee', name: '바닐라 라떼', price: 5500, description: '달콤한 바닐라 시럽과 에스프레소가 어우러진 기분 좋은 달콤함.', img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80' },
        { id: 'm4', category: 'coffee', name: '콜드브루', price: 5000, description: '12시간 이상 차갑게 우려내어 쓴맛이 적고 깔끔한 풍미의 커피.', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80' },
        
        { id: 'm5', category: 'beverage', name: '딸기 스무디', price: 6000, description: '상큼한 생딸기를 듬뿍 갈아 만든 시원한 스무디.', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80' },
        { id: 'm6', category: 'beverage', name: '자몽 에이드', price: 5500, description: '톡 쏘는 탄산과 쌉싸름한 자몽 청이 만난 청량감 가득한 에이드.', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80' },
        { id: 'm7', category: 'beverage', name: '밀크티', price: 5500, description: '진하게 우려낸 홍차에 부드러운 우유를 더한 클래식 밀크티.', img: './img/밀크티.jpg' },
        { id: 'm8', category: 'beverage', name: '제주 녹차 라떼', price: 5500, description: '제주산 유기농 말차 가루로 만든 진하고 쌉쌀한 매력의 라떼.', img: './img/녹차라떼.jpg' },

        { id: 'm9', category: 'dessert', name: '티라미수', price: 6500, description: '부드러운 레이디핑거와 진한 마스카포네 치즈의 앙상블.', img: './img/티라미수.jpg' },
        { id: 'm10', category: 'dessert', name: '뉴욕 치즈 케이크', price: 6000, description: '꾸덕하고 진한 크림치즈의 풍미가 가득한 치즈 케이크.', img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80' },
        { id: 'm11', category: 'dessert', name: '크로플', price: 5000, description: '겉은 바삭하고 속은 쫄깃한 와플에 메이플 시럽을 곁들였습니다.', img: './img/크로플.jpg' },
        { id: 'm12', category: 'dessert', name: '마카롱 세트', price: 7500, description: '쫀득한 꼬끄와 달콤한 필링, 베스트 맛 3가지 마카롱 세트.', img: './img/마카롱.jpg' }
    ];

    // 이번에는 사진 교체를 위해 무조건 강제로 덮어쓰기
    let menus = defaultMenus;
    localStorage.setItem('cafe_menus', JSON.stringify(menus));

    function renderMainMenus(filterCategory = 'all') {
        menuGrid.innerHTML = ''; 

        const targetMenus = filterCategory === 'all' 
            ? menus 
            : menus.filter(item => item.category === filterCategory);

        if (targetMenus.length === 0) {
            menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 50px 0; color:#999;">현재 준비 중인 메뉴입니다. 곧 찾아뵐게요! ☕</p>';
            return;
        }

        targetMenus.forEach(menu => {
            const card = document.createElement('div');
            card.className = 'main-menu-card';
            
            const categoryEmoji = menu.category === 'coffee' ? '☕ 커피' : menu.category === 'beverage' ? '🍹 음료' : '🍰 디저트';
            
            const imgHTML = menu.img ? `<div style="height:160px; width:100%; border-radius:8px; margin-bottom:12px; background:url('${menu.img}') center/cover no-repeat;"></div>` : '';

            const isBest = ['m1', 'm5'].includes(menu.id);
            const isNew = ['m11'].includes(menu.id);
            const extraBadge = isBest ? '<span class="status-badge best">BEST</span>' : (isNew ? '<span class="status-badge new">NEW</span>' : '');

            card.innerHTML = `
                <div onclick="location.href='menus/detail.html?id=${menu.id}'" style="cursor:pointer;">
                    ${imgHTML}
                    <div style="position:absolute; top:18px; left:18px; display:flex; gap:5px;">
                        ${extraBadge}
                    </div>
                    <span class="card-badge">${categoryEmoji}</span>
                    <h3 class="card-title">${menu.name}</h3>
                    <p class="card-desc">${menu.description || 'Cafe Warmth의 정성이 담긴 메뉴입니다.'}</p>
                </div>
                <div class="card-bottom">
                    <span class="card-price">₩${menu.price.toLocaleString()}</span>
                    <button class="btn-add-cart" onclick="addToBasket('${menu.id}', '${menu.name}')">+</button>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const selectedCategory = e.target.getAttribute('data-category');
            renderMainMenus(selectedCategory);
        });
    });

    renderMainMenus();
});

// 토스트 알림 함수
window.showToast = function(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.style.cssText = `
            position: fixed; bottom: 40px; right: 40px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-left: 6px solid var(--primary-color, #8D6E63);
            color: #3E2723; padding: 18px 26px;
            border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            font-weight: bold; font-size: 1.15rem;
            z-index: 9999; opacity: 0; transform: translateX(100px);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex; align-items: center; gap: 12px; pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `<span style="font-size:1.5rem;">🛒</span> <span>${message}</span>`;
    
    toast.offsetHeight; // 리플로우 강제 발생
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    
    window.toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
    }, 1000);
};

window.addToBasket = function(id, name) {
    // 모달 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'detail-modal-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s; padding:20px; box-sizing:border-box;';
    
    // 모달 컨테이너
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background:white; width:100%; max-width:450px; height:80vh; max-height:800px; border-radius:16px; position:relative; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.2); transform:translateY(20px); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display:flex; flex-direction:column;';
    
    // 닫기 버튼
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = 'position:absolute; top:15px; right:15px; z-index:10000; background:rgba(255,255,255,0.9); border:none; border-radius:50%; width:32px; height:32px; font-size:1.2rem; cursor:pointer; display:flex; justify-content:center; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.1); color:#333;';
    closeBtn.onclick = closeOverlay;
    
    // iframe으로 상세페이지 호출 (modal=true 파라미터 추가)
    const iframe = document.createElement('iframe');
    iframe.src = `menus/detail.html?id=${id}&modal=true`;
    iframe.style.cssText = 'width:100%; height:100%; border:none; flex:1;';
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(iframe);
    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);
    
    // 애니메이션 실행
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    });
    
    function closeOverlay() {
        overlay.style.opacity = '0';
        modalContent.style.transform = 'translateY(20px)';
        setTimeout(() => overlay.remove(), 300);
    }
    
    // iframe에서 담기 완료 메시지가 오면 모달 닫고 토스트 띄움
    window.addEventListener('message', function msgHandler(e) {
        if (e.data === 'closeModal') {
            closeOverlay();
            window.removeEventListener('message', msgHandler);
            showToast('장바구니에 담았어요!');
        }
    });
};

window.promptAdminPassword = function() {
    const pwd = prompt('관리자 비밀번호를 입력해주세요.\\n(기본 비밀번호: 1234)');
    if (pwd === '1234') {
        location.href = 'admin/menus/list.html';
    } else if (pwd !== null) {
        alert('비밀번호가 일치하지 않습니다.');
    }
};
