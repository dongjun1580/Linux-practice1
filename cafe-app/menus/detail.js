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

    document.getElementById('btn-add-cart').addEventListener('click', () => {
        let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
        const duplicateItem = basket.find(item => item.id === menu.id);
        
        if (duplicateItem) {
            duplicateItem.quantity += 1;
        } else {
            basket.push({ id: menu.id, name: menu.name, quantity: 1 });
        }
        
        localStorage.setItem('cafe_basket', JSON.stringify(basket));
        
        showToast('장바구니에 담았어요!');
    });
});
