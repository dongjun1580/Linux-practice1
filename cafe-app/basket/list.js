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
            // 과거에 수량 없이 담긴 아이템 호환 처리
            if (item.quantity === undefined || isNaN(item.quantity)) {
                item.quantity = 1;
            }

            // getPrice(item.id) 대신 커스텀 옵션이 모두 계산된 item.price를 사용
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
    btnCheckout.addEventListener('click', async () => {
        if(basket.length === 0) return;
        
        let userName = '비회원';
        let userId = null;
        if (window.sbClient) {
            const { data: { session } } = await window.sbClient.auth.getSession();
            if (session?.user) {
                userName = session.user.email.split('@')[0]; // 이메일 앞부분을 이름으로 사용
                userId = session.user.id;
            }
        }

        const totalPrice = parseInt(totalPriceEl.textContent.replace(/[^0-9]/g, ''));

        try {
            // [중요 에러 방지] 장바구니에 담긴 메뉴들을 Supabase menus 테이블에 강제로 집어넣어 외래키 에러를 예방합니다.
            const menusToSync = basket.map(item => ({
                id: item.id.toString(),
                name: item.name,
                price: item.price !== undefined ? item.price : 0,
                category: '기타' // 기본 카테고리
            }));
            
            try {
                // onConflict로 id가 이미 있으면 무시하거나 업데이트하도록 처리 (에러 안남)
                await window.sbClient.from('menus').upsert(menusToSync, { onConflict: 'id', ignoreDuplicates: true });
            } catch(syncErr) {
                console.warn('메뉴 동기화 무시됨 (RLS 등):', syncErr);
            }

            // 1. orders 테이블에 주문서 저장
            const { data: orderData, error: orderError } = await window.sbClient
                .from('orders')
                .insert([{
                    user_id: userId,
                    user_name: userName,
                    total_price: totalPrice,
                    status: '준비 중'
                }])
                .select('id')
                .single();

            if (orderError) throw orderError;
            const orderId = orderData.id;

            // 2. order_items 테이블에 장바구니 상세 메뉴들 저장
            const orderItems = basket.map(item => ({
                order_id: orderId,
                menu_id: item.id,
                quantity: item.quantity,
                options: item.options || {}
            }));

            const { error: itemsError } = await window.sbClient
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. 로그인한 회원이면 스탬프 적립 및 쿠폰 발급 처리
            if (userId) {
                const newItemsCount = basket.reduce((sum, item) => sum + item.quantity, 0);
                
                // 기존 프로필 스탬프 개수 조회
                const { data: profile } = await window.sbClient
                    .from('profiles')
                    .select('stamps')
                    .eq('id', userId)
                    .single();
                    
                if (profile) {
                    const currentStamps = profile.stamps || 0;
                    const totalStamps = currentStamps + newItemsCount;
                    
                    const newCouponsCount = Math.floor(totalStamps / 10);
                    const remainingStamps = totalStamps % 10;
                    
                    // 쿠폰 생성 로직 (10개 달성마다 1장)
                    if (newCouponsCount > 0) {
                        const couponsToInsert = [];
                        for (let i = 0; i < newCouponsCount; i++) {
                            const expireDate = new Date();
                            expireDate.setDate(expireDate.getDate() + 30);
                            
                            couponsToInsert.push({
                                user_id: userId,
                                name: '아메리카노 1잔 무료 쿠폰',
                                expires_at: expireDate.toISOString()
                            });
                        }
                        const { error: cpError } = await window.sbClient.from('coupons').insert(couponsToInsert);
                        if (cpError) {
                            console.error("쿠폰 발급 에러:", cpError);
                            alert("쿠폰 발급 중 권한 오류가 발생했습니다. (RLS 정책을 확인해주세요)");
                        } else {
                            alert(`🎉 축하합니다! 스탬프 10개를 달성하여 무료 쿠폰 ${newCouponsCount}장이 발급되었습니다! 마이페이지에서 확인하세요.`);
                        }
                    }
                    
                    // 프로필의 남은 스탬프 업데이트
                    const { error: pfError } = await window.sbClient.from('profiles').update({ stamps: remainingStamps }).eq('id', userId);
                    if (pfError) {
                        console.error("스탬프 갱신 에러:", pfError);
                    }
                }
            }

            // 내가 주문한 ID를 로컬스토리지에 기록 (비회원 주문 내역 조회용)
            let myOrderIds = JSON.parse(localStorage.getItem('cafe_my_order_ids')) || [];
            myOrderIds.push(orderId);
            localStorage.setItem('cafe_my_order_ids', JSON.stringify(myOrderIds));

            // 성공적으로 저장되었으므로 로컬스토리지 장바구니 비우기
            localStorage.removeItem('cafe_basket');
            basket = [];
            
            alert('주문이 성공적으로 접수되었습니다! ☕');
            location.href = '../orders/list.html'; // 고객 주문 내역 페이지로 이동
            
        } catch (error) {
            console.error("주문 처리 중 오류 발생:", error);
            alert(`주문 접수에 실패했습니다: ${error.message || JSON.stringify(error)}\n잠시 후 다시 시도해주세요.`);
        }
    });

    renderBasket();
});

window.goToDetail = function(id) {
    localStorage.setItem('cafe_current_menu_id', id);
    localStorage.setItem('cafe_is_modal', 'false');
    location.href = '../menus/detail.html';
};
