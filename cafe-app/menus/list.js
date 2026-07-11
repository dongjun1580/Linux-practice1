document.addEventListener('DOMContentLoaded', () => {
    // 1. 상태 관리 변수
    let currentCategory = 'all';
    let searchQuery = '';
    
    // 2. DOM 요소 캐싱
    const categoryNav = document.getElementById('categoryNav');
    const menuGrid = document.getElementById('menuGrid');
    const searchInput = document.getElementById('searchInput');
    const cartBadge = document.getElementById('cartBadge');

    // 3. 초기화 로직
    initCategoryTabs();
    renderMenuList();
    updateCartBadge();
    initEventListeners();

    /**
     * 카테고리 탭 목록을 js/data.js 데이터를 기반으로 동적 생성합니다.
     */
    function initCategoryTabs() {
        // data.js에 존재하는 템플릿(예: cafeCategories = [{id: 'coffee', name: '커피'}, ...]) 가정
        if (typeof cafeCategories !== 'undefined') {
            cafeCategories.forEach(category => {
                const button = document.createElement('button');
                button.className = 'category-tab';
                button.dataset.category = category.id;
                button.textContent = category.name;
                categoryNav.appendChild(button);
            });
        }
    }

    /**
     * 조건(카테고리, 검색어)에 맞는 메뉴 리스트를 필터링하여 렌더링합니다.
     */
    function renderMenuList() {
        // data.js의 전역 변수(예: cafeMenus) 검증
        if (typeof cafeMenus === 'undefined' || cafeMenus.length === 0) {
            menuGrid.innerHTML = '<div class="empty-placeholder">등록된 메뉴가 없습니다.</div>';
            return;
        }

        // 필터링 규칙 적용
        const filteredMenus = cafeMenus.filter(menu => {
            const matchesCategory = currentCategory === 'all' || menu.category === currentCategory;
            const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // 결과가 없을 때의 처리
        if (filteredMenus.length === 0) {
            menuGrid.innerHTML = '<div class="empty-placeholder">검색 결과와 일치하는 메뉴가 없습니다.</div>';
            return;
        }

        // HTML 카드 템플릿 생성 및 주입
        menuGrid.innerHTML = filteredMenus.map(menu => {
            // utils.js에금액 포맷 함수(formatPrice)가 있다고 가정, 없을 시 기본 계산 활용
            const displayPrice = typeof formatPrice === 'function' 
                ? formatPrice(menu.price) 
                : `${menu.price.toLocaleString()}원`;

            return `
                <a href="./detail.html?id=${menu.id}" class="menu-card">
                    <div class="menu-img-wrapper">
                        <img src="${menu.image || '../css/default-menu.png'}" alt="${menu.name}" class="menu-img" loading="lazy">
                    </div>
                    <div class="menu-info">
                        <span class="menu-name">${menu.name}</span>
                        <span class="menu-price">${displayPrice}</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    /**
     * 장바구니 유틸리티를 활용해 상단 배지 수량을 업데이트합니다.
     */
    function updateCartBadge() {
        if (typeof getCartCount === 'function') {
            const count = getCartCount();
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'block' : 'none';
        } else {
            // utils.js가 미완성일 때를 대비한 LocalStorage 직접 파싱 폴백(Fallback)
            const basket = JSON.parse(localStorage.getItem('cafe-basket') || '[]');
            const count = basket.reduce((acc, item) => acc + (item.quantity || 0), 0);
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    /**
     * 이벤트 리스너 통합 등록
     */
    function initEventListeners() {
        // 카테고리 탭 클릭 이벤트 (이벤트 위임)
        categoryNav.addEventListener('click', (e) => {
            const targetButton = e.target.closest('.category-tab');
            if (!targetButton) return;

            // 활성화 스타일 전환
            document.querySelectorAll('.category-tab').forEach(btn => btn.classList.remove('active'));
            targetButton.classList.add('active');

            // 상태 변경 후 리스트 갱신
            currentCategory = targetButton.dataset.category;
            renderMenuList();
        });

        // 검색창 실시간 입력 이벤트 (Debounce를 적용하면 더 좋음)
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderMenuList();
        });
    }
});