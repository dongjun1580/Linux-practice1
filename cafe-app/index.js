// index.js
document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('main-menu-grid');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // 1. 관리자 데이터(cafe_menus) 가져오기 및 초기 샘플 세팅
    const sampleMenus = [
        { id: 's1', name: '시그니처 브라운 라떼', price: 5800, category: 'coffee', description: '천연 비닐라 빈 시럽과 쫀쫀한 크림이 올라간 시그니처 커피' },
        { id: 's2', name: '카페 아메리카노', price: 4500, category: 'coffee', description: '고소한 견과류 풍미와 깔끔한 바디감을 가진 밸런스 커피' },
        { id: 's3', name: '생딸기 크림 에이드', price: 6000, category: 'beverage', description: '싱싱한 국산 딸기 과육이 가득 씹히는 상큼한 시즌 음료' },
        { id: 's4', name: '프렌치 아이스크림 크로플', price: 6500, category: 'dessert', description: '프랑스산 생지로 구운 바삭한 크로플과 하겐다즈 바닐라' }
    ];

    let menus = JSON.parse(localStorage.getItem('cafe_menus'));
    
    // 등록된 메뉴가 아예 없을 때만 샘플 배열로 채워주기
    if (!menus || menus.length === 0) {
        menus = sampleMenus;
        localStorage.setItem('cafe_menus', JSON.stringify(sampleMenus));
    }

    // 2. 카테고리별 조건부 렌더링 기능
    function renderMainMenus(filterCategory = 'all') {
        menuGrid.innerHTML = ''; // 기존 카드 리셋

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
            
            card.innerHTML = `
                <span class="card-badge">${categoryEmoji}</span>
                <h3 class="card-title">${menu.name}</h3>
                <p class="card-desc">${menu.description || 'Cafe Warmth의 정성이 담긴 메뉴입니다.'}</p>
                <div class="card-bottom">
                    <span class="card-price">₩${menu.price.toLocaleString()}</span>
                    <button class="btn-add-cart" onclick="addToBasket('${menu.id}', '${menu.name}')">+</button>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }

    // 3. 탭 버튼 클릭 핸들러 연동
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // 활성화 클래스 토글
            tabButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // 기입된 카테고리 속성값 읽어서 필터 실행
            const selectedCategory = e.target.getAttribute('data-category');
            renderMainMenus(selectedCategory);
        });
    });

    // 앱 첫 로드 시 전체 보기 실행
    renderMainMenus();
});

// 4. 장바구니 담기 기능 (버튼 클릭 타겟을 위해 글로벌로 개방)
window.addToBasket = function(id, name) {
    // 4단계 장바구니 로직용 데이터 구조 미리 생성
    let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
    
    const duplicateItem = basket.find(item => item.id === id);
    if (duplicateItem) {
        duplicateItem.quantity += 1;
    } else {
        basket.push({ id: id, name: name, quantity: 1 });
    }
    
    localStorage.setItem('cafe_basket', JSON.stringify(basket));
    alert(`🛒 장바구니에 [${name}] 1잔이 추가되었습니다.`);
};
