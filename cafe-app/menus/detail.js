document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const menuId = params.get('id') || localStorage.getItem('cafe_current_menu_id');
    const isModal = params.get('modal') === 'true' || localStorage.getItem('cafe_is_modal') === 'true';

    if (isModal) {
        const header = document.getElementById('modal-header');
        if (header) header.style.display = 'none';
        document.body.style.padding = '0';
        document.body.style.background = 'transparent';
        const container = document.querySelector('.container');
        if(container) {
            container.style.padding = '0';
        }
        const footer = document.querySelector('.footer-actions');
        if(footer) {
            footer.style.position = 'static';
            footer.style.boxShadow = 'none';
            footer.style.padding = '0';
            footer.style.marginTop = '15px';
        }
    }

    if (!menuId) {
        alert('잘못된 접근입니다.');
        if(!isModal) location.href = '../index.html';
        return;
    }

    let menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];
    let currentMenu = menus.find(m => m.id === menuId);

    if (!currentMenu) {
        alert('메뉴를 찾을 수 없습니다.');
        if(!isModal) location.href = '../index.html';
        return;
    }

    document.getElementById('menu-name').textContent = currentMenu.name;
    document.getElementById('menu-desc').textContent = currentMenu.description || '';
    document.getElementById('base-price').textContent = `${currentMenu.price.toLocaleString()}원`;
    if (currentMenu.img) {
        document.getElementById('menu-img').src = currentMenu.img.startsWith('http') ? currentMenu.img : `../${currentMenu.img}`;
    }

    let basePrice = currentMenu.price;
    let shotCount = 0;
    let syrupCount = 0;
    let sizePrice = 0;
    let selectedTemp = 'HOT';
    let selectedSize = '기본';
    let selectedIce = '보통';

    const elTotalPrice = document.getElementById('total-price');
    const elShotCount = document.getElementById('shot-count');
    const elSyrupCount = document.getElementById('syrup-count');
    
    function updatePrice() {
        const total = basePrice + sizePrice + (shotCount * 500) + (syrupCount * 500);
        elTotalPrice.textContent = `${total.toLocaleString()}원`;
    }

    // 옵션 버튼 클릭 (온도, 사이즈, 얼음양)
    document.querySelectorAll('.btn-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const type = target.dataset.type;
            const val = target.dataset.value;
            
            document.querySelectorAll(`.btn-option[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
            target.classList.add('active');

            if(type === 'temp') selectedTemp = val;
            if(type === 'size') {
                selectedSize = val;
                sizePrice = (val === '메가') ? 500 : 0;
                updatePrice();
            }
            if(type === 'ice') selectedIce = val;
        });
    });

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

    document.getElementById('btn-add-cart').addEventListener('click', () => {
        let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
        
        const item = {
            id: Date.now().toString(),
            menuId: currentMenu.id,
            name: currentMenu.name,
            basePrice: currentMenu.price,
            options: {
                temp: selectedTemp,
                size: selectedSize,
                shot: shotCount,
                syrup: syrupCount,
                ice: selectedIce
            },
            price: basePrice + sizePrice + (shotCount * 500) + (syrupCount * 500)
        };

        basket.push(item);
        localStorage.setItem('cafe_basket', JSON.stringify(basket));

        if (isModal) {
            window.parent.postMessage('closeModal', '*');
        } else {
            alert('장바구니에 담았습니다!');
            location.href = '../index.html';
        }
    });

    updatePrice();
});