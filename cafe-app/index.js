// index.js
if (!localStorage.getItem('orders_reset_done_v1')) {
    localStorage.removeItem('cafe_orders');
    localStorage.setItem('orders_reset_done_v1', 'true');
}
document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('main-menu-grid');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // 로그인 상태 확인 및 네비게이션 렌더링
    checkAuthAndRenderNav();

    // Supabase DB에서 가져온 메뉴 데이터를 담을 변수
    let menus = [];

    // Supabase에서 메뉴 목록 불러오기
    async function loadMenusFromDB() {
        try {
            // DB의 menus 테이블에서 모든(*) 데이터 가져오기
            const { data, error } = await window.sbClient.from('menus').select('*');
            
            if (error) throw error;
            
            menus = data;
            // 다른 파일(상세, 장바구니)에서도 쉽게 쓰도록 로컬스토리지에 최신 데이터 캐싱
            localStorage.setItem('cafe_menus', JSON.stringify(menus));
            
            renderMainMenus(); // 데이터 로딩 완료 후 화면 렌더링
        } catch (error) {
            console.error("메뉴 정보를 불러오는 중 에러 발생:", error);
            menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 50px 0; color:#e53935;">메뉴 데이터를 불러오지 못했습니다.</p>';
        }
    }

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

            const isBest = menu.is_best === true;
            const isNew = menu.is_new === true;
            const extraBadge = isBest ? '<span class="status-badge best">BEST</span>' : (isNew ? '<span class="status-badge new">NEW</span>' : '');

            card.innerHTML = `
                <div onclick="window.goToDetail('${menu.id}')" style="cursor:pointer;">
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

    // 화면 진입 시 DB에서 메뉴 로딩 시작
    loadMenusFromDB();
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

window.goToDetail = function(id) {
    localStorage.setItem('cafe_current_menu_id', id);
    localStorage.setItem('cafe_is_modal', 'false');
    location.href = 'menus/detail.html';
};

window.addToBasket = function(id, name) {
    localStorage.setItem('cafe_current_menu_id', id);
    localStorage.setItem('cafe_is_modal', 'true');
    
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
    
    // iframe으로 상세페이지 호출 (query string 유실 대비 localStorage 사용)
    const iframe = document.createElement('iframe');
    iframe.src = `menus/detail.html`;
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

async function checkAuthAndRenderNav() {
    const nav = document.getElementById('auth-nav');
    if (!nav) return;
    
    try {
        // Supabase에서 현재 로그인된 사용자 정보 가져오기
        const { data: { session } } = await window.sbClient.auth.getSession();
        const user = session?.user;

        if (user) {
            // DB의 'profiles' 테이블에서 현재 로그인한 유저의 정보를 가져옵니다.
            const { data: profile } = await window.sbClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            
            // 가져온 권한이 'admin'인지 확인
            const isAdmin = profile?.role === 'admin';
            
            nav.innerHTML = `
                <span style="font-size:0.9rem; color:#666; margin-right:15px; font-weight:bold;">${user.email.split('@')[0]}님</span>
                ${isAdmin ? '<button onclick="location.href=\'admin/menus/list.html\'" class="btn-nav admin-link" style="background:#e53935; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; margin-right:10px;">⚙️ 관리자 모드</button>' : ''}
                <button onclick="logout()" class="btn-nav" style="border:1px solid #ddd; background:white; padding:8px 12px; border-radius:6px; cursor:pointer;">로그아웃</button>
            `;
        } else {
            nav.innerHTML = `
                <button onclick="location.href='auth/login.html'" class="btn-nav" style="background:var(--primary-color); color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold;">로그인</button>
            `;
        }
    } catch(error) {
        console.error("인증 정보를 가져오는 중 에러 발생:", error);
        nav.innerHTML = `
            <button onclick="location.href='auth/login.html'" class="btn-nav" style="background:var(--primary-color); color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold;">로그인</button>
        `;
    }
}

window.logout = async function() {
    await window.sbClient.auth.signOut();
    location.reload(); // 로그아웃 후 새로고침
};
