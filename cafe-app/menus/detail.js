// menus/detail.js
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
    
    toast.offsetHeight;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    
    // 1초 만에 더 빨리 사라지도록 수정
    window.toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
    }, 1000);
};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const menuId = params.get('id');

    if (!menuId) {
        alert('잘못된 접근입니다.');
        location.href = 'list.html';
        return;
    }

    const menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];
    const menu = menus.find(m => m.id === menuId);

    if (!menu) {
        alert('존재하지 않는 메뉴입니다.');
        location.href = 'list.html';
        return;
    }

    if(menu.img) {
        const detailCard = document.querySelector('.detail-card');
        const imgEl = document.createElement('div');
        imgEl.style.cssText = `height: 250px; width: 100%; border-radius: 12px; margin-bottom: 25px; background: url('${menu.img}') center/cover no-repeat;`;
        detailCard.insertBefore(imgEl, document.getElementById('menu-name'));
    }

    document.getElementById('menu-name').textContent = menu.name;
    document.getElementById('menu-desc').textContent = menu.description || '이 메뉴는 특별한 설명이 필요 없을 만큼 훌륭합니다.';
    document.getElementById('menu-price').textContent = `₩${menu.price.toLocaleString()}`;

    let currentPrice = menu.price;
    let shotCount = 0;
    let syrupCount = 0;
    
    const sizeRadios = document.querySelectorAll('input[name="size"]');
    const tempRadios = document.querySelectorAll('input[name="temperature"]');
    const shotMinus = document.getElementById('shot-minus');
    const shotPlus = document.getElementById('shot-plus');
    const shotCountEl = document.getElementById('shot-count');
    const syrupMinus = document.getElementById('syrup-minus');
    const syrupPlus = document.getElementById('syrup-plus');
    const syrupCountEl = document.getElementById('syrup-count');
    const iceAmountGroup = document.getElementById('ice-amount-group');
    const iceAmountSelect = document.getElementById('ice-amount');
    const totalPriceEl = document.getElementById('total-price');

    function updatePrice() {
        let addedPrice = 0;
        
        const selectedSize = document.querySelector('input[name="size"]:checked').value;
        if (selectedSize === 'large') addedPrice += 500;
        
        addedPrice += shotCount * 500;
        addedPrice += syrupCount * 500;

        const isIced = document.querySelector('input[name="temperature"]:checked').value === 'ICED';
        iceAmountGroup.style.display = isIced ? 'flex' : 'none';

        currentPrice = menu.price + addedPrice;
        totalPriceEl.textContent = `₩${currentPrice.toLocaleString()}`;
    }

    sizeRadios.forEach(r => r.addEventListener('change', updatePrice));
    tempRadios.forEach(r => r.addEventListener('change', updatePrice));

    shotMinus.addEventListener('click', () => {
        if (shotCount > 0) {
            shotCount--;
            shotCountEl.textContent = shotCount;
            updatePrice();
        }
    });

    shotPlus.addEventListener('click', () => {
        if (shotCount < 5) {
            shotCount++;
            shotCountEl.textContent = shotCount;
            updatePrice();
        }
    });

    syrupMinus.addEventListener('click', () => {
        if (syrupCount > 0) {
            syrupCount--;
            syrupCountEl.textContent = syrupCount;
            updatePrice();
        }
    });

    syrupPlus.addEventListener('click', () => {
        if (syrupCount < 5) {
            syrupCount++;
            syrupCountEl.textContent = syrupCount;
            updatePrice();
        }
    });

    updatePrice(); // 초기 계산

    if (params.get('modal') === 'true') {
        const header = document.querySelector('.main-header');
        if (header) header.style.display = 'none';
        document.body.style.padding = '0';
        document.body.style.background = '#fff';
        const main = document.querySelector('.detail-main');
        if (main) main.style.padding = '20px';
        const card = document.querySelector('.detail-card');
        if (card) { 
            card.style.border = 'none'; 
            card.style.boxShadow = 'none'; 
            card.style.padding = '0'; 
            card.style.background = 'transparent';
        }
    }

    document.getElementById('btn-add-cart').addEventListener('click', () => {
        let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
        
        const temp = document.querySelector('input[name="temperature"]:checked').value;
        const size = document.querySelector('input[name="size"]:checked').value;
        const ice = temp === 'ICED' ? iceAmountSelect.value : 'N/A';

        const customOptions = { temp, size, shot: shotCount, syrup: syrupCount, ice };
        
        const duplicateItem = basket.find(item => 
            item.id === menu.id && JSON.stringify(item.options) === JSON.stringify(customOptions)
        );
        
        if (duplicateItem) {
            duplicateItem.quantity += 1;
        } else {
            basket.push({ 
                id: menu.id, 
                name: menu.name, 
                price: currentPrice,
                basePrice: menu.price,
                options: customOptions,
                quantity: 1 
            });
        }
        
        localStorage.setItem('cafe_basket', JSON.stringify(basket));
        
        if (params.get('modal') === 'true') {
            window.parent.postMessage('closeModal', '*');
        } else {
            showToast('장바구니에 담았어요!');
        }
    });
});
