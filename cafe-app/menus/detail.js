document.addEventListener('DOMContentLoaded', () => {
    // URL 파라미터 또는 localStorage에서 ID와 모달 상태 가져오기
    const params = new URLSearchParams(location.search);
    const menuId = params.get('id') || localStorage.getItem('cafe_current_menu_id');
    const isModal = params.get('modal') === 'true' || localStorage.getItem('cafe_is_modal') === 'true';

    // 모달 모드일 경우 헤더 숨기기 등 스타일 조정
    if (isModal) {
        const header = document.querySelector('.main-header');
        if (header) header.style.display = 'none';
        document.body.style.padding = '0';
        document.body.style.background = '#fff';
    }

    if (!menuId) {
        alert('잘못된 접근입니다.');
        if(!isModal) location.href = '../index.html';
        return;
    }

    // 메뉴 데이터 로드
    let menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];
    let currentMenu = menus.find(m => m.id === menuId);

    if (!currentMenu) {
        alert('메뉴를 찾을 수 없습니다.');
        if(!isModal) location.href = '../index.html';
        return;
    }

    // 기본 정보 세팅
    document.getElementById('menu-name').textContent = currentMenu.name;
    document.getElementById('menu-desc').textContent = currentMenu.description || '';
    document.getElementById('base-price').textContent = `${currentMenu.price.toLocaleString()}원`;
    if (currentMenu.img) {
        document.getElementById('menu-img').src = currentMenu.img.startsWith('http') ? currentMenu.img : `../${currentMenu.img}`;
    }

    // 옵션 관련 상태
    let basePrice = currentMenu.price;
    let shotCount = 0;
    let syrupCount = 0;
    let sizePrice = 0;

    const elTotalPrice = document.getElementById('total-price');
    const elShotCount = document.getElementById('shot-count');
    const elSyrupCount = document.getElementById('syrup-count');
    
    // 금액 업데이트 함수
    function updatePrice() {
        const total = basePrice + sizePrice + (shotCount * 500) + (syrupCount * 500);
        elTotalPrice.textContent = `${total.toLocaleString()}원`;
    }

    // 라디오 버튼 이벤트 (사이즈 변경 감지)
    document.querySelectorAll('input[name="size"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            sizePrice = e.target.value === '메가' ? 500 : 0;
            updatePrice();
        });
    });

    // 샷 추가 버튼 이벤트
    document.getElementById('btn-shot-plus').addEventListener('click', () => {
        shotCount++;
        elShotCount.textContent = shotCount;
        updatePrice();
    });
    document.getElementById('btn-shot-minus').addEventListener('click', () => {
        if(shotCount > 0) {
            shotCount--;
            elShotCount.textContent = shotCount;
            updatePrice();
        }
    });

    // 시럽 추가 버튼 이벤트
    document.getElementById('btn-syrup-plus').addEventListener('click', () => {
        syrupCount++;
        elSyrupCount.textContent = syrupCount;
        updatePrice();
    });
    document.getElementById('btn-syrup-minus').addEventListener('click', () => {
        if(syrupCount > 0) {
            syrupCount--;
            elSyrupCount.textContent = syrupCount;
            updatePrice();
        }
    });

    // 장바구니 담기 이벤트
    document.getElementById('btn-add-cart').addEventListener('click', () => {
        let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
        
        const temp = document.querySelector('input[name="temperature"]:checked').value;
        const size = document.querySelector('input[name="size"]:checked').value;
        const ice = document.getElementById('ice-amount').value;

        const item = {
            id: Date.now().toString(),
            menuId: currentMenu.id,
            name: currentMenu.name,
            basePrice: currentMenu.price,
            options: {
                temp: temp,
                size: size,
                shot: shotCount,
                syrup: syrupCount,
                ice: ice
            },
            price: basePrice + sizePrice + (shotCount * 500) + (syrupCount * 500)
        };

        basket.push(item);
        localStorage.setItem('cafe_basket', JSON.stringify(basket));

        if (isModal) {
            // 부모 창(index.js)에 메시지 전달
            window.parent.postMessage('closeModal', '*');
        } else {
            alert('장바구니에 담았습니다!');
            location.href = '../index.html';
        }
    });

    // 초기 금액 계산
    updatePrice();
});