document.addEventListener('DOMContentLoaded', () => {
    const basketList = document.getElementById('basket-items');
    const totalPriceEl = document.getElementById('total-price');
    const btnCheckout = document.getElementById('btn-checkout');

    let basket = JSON.parse(localStorage.getItem('cafe_basket')) || [];
    const menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];

    // 메뉴 가격 찾기 유틸
    const getPrice = (menuId) => {
        const menu = menus.find(m => m.id === menuId);
        return menu ? menu.price : 0;
    };

    function renderBasket() {
        basketList.innerHTML = '';
        let total = 0;

        if (basket.length === 0) {
            basketList.innerHTML = '<li class="empty-msg">장바구니가 비어있습니다. 🥲</li>';
            totalPriceEl.textContent = '₩0';
            btnCheckout.style.display = 'none';
            return;
        }

        btnCheckout.style.display = 'block';

        basket.forEach((item, index) => {
            // getPrice(item.id) 대신 커스텀 옵션이 모두 계산된 item.price를 사용 (0원 쿠폰도 정상 처리)
            const price = item.price !== undefined ? item.price : getPrice(item.id); 
            const itemTotal = price * item.quantity;
            total += itemTotal;

            // 옵션 텍스트 생성
            let optionsText = '';
            if (item.options) {
                const opt = item.options;
                optionsText = `<div class="item-options" style="font-size:0.85em; color:#777; margin-top:4px;">
                    [${opt.temp}] 사이즈: ${opt.size === 'large' ? '메가' : '기본'}, 샷 추가: ${opt.shot || 0}, 시럽: ${opt.syrup || 0}, 얼음: ${
                        opt.ice === 'normal' ? '보통' : (opt.ice === 'less' ? '적게' : (opt.ice === 'more' ? '많이' : '해당없음'))
                    }
                </div>`;
            }

            const li = document.createElement('li');
            li.className = 'basket-item';
            li.innerHTML = `
                <div class="item-info" onclick="window.goToDetail('${item.id}')" style="cursor:pointer; flex:1;" title="메뉴 상세 보기">
                    <span class="item-name" style="text-decoration:underline; text-underline-offset:2px;">${item.name}</span>
                    ${optionsText}
                    <span class="item-price" style="display:block; margin-top:4px;">단가: ₩${price.toLocaleString()}</span>
                </div>
                <div class="item-actions">
                    <div class="qty-control">
                        <button class="btn-qty" onclick="updateQty(${index}, -1)">-</button>
                        <span class="item-qty">${item.quantity}</span>
                        <button class="btn-qty" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                    <button class="btn-remove" onclick="removeItem(${index})">삭제</button>
                </div>
            `;
            basketList.appendChild(li);
        });

        totalPriceEl.textContent = `₩${total.toLocaleString()}`;
    }

    // 수량 조절
    window.updateQty = (index, delta) => {
        basket[index].quantity += delta;
        if (basket[index].quantity <= 0) {
            basket.splice(index, 1);
        }
        saveAndRender();
    };

    // 아이템 삭제
    window.removeItem = (index) => {
        basket.splice(index, 1);
        saveAndRender();
    };

    function saveAndRender() {
        localStorage.setItem('cafe_basket', JSON.stringify(basket));
        renderBasket();
    }

    // 주문하기 기능
    btnCheckout.addEventListener('click', () => {
        if(basket.length === 0) return;
        
        let orders = JSON.parse(localStorage.getItem('cafe_orders')) || [];
        const newOrder = {
            id: 'ord_' + new Date().getTime(),
            date: new Date().toISOString(),
            items: [...basket],
            totalPrice: parseInt(totalPriceEl.textContent.replace(/[^0-9]/g, ''))
        };
        orders.push(newOrder);
        localStorage.setItem('cafe_orders', JSON.stringify(orders));
        
        // 장바구니 비우기
        localStorage.removeItem('cafe_basket');
        basket = [];
        
        alert('주문이 성공적으로 접수되었습니다! ☕');
        location.href = '../orders/list.html'; // 고객 주문 내역 페이지로 이동
    });

    renderBasket();
});

window.goToDetail = function(id) {
    localStorage.setItem('cafe_current_menu_id', id);
    localStorage.setItem('cafe_is_modal', 'false');
    location.href = '../menus/detail.html';
};
