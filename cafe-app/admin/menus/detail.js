document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get('id') || localStorage.getItem('admin_target_menu_id');
    
    if(!targetId) {
        alert('잘못된 접근입니다.');
        location.href = 'list.html';
        return;
    }

    // DB에서 메뉴 가져오기
    async function loadMenu() {
        try {
            const { data: menu, error } = await window.sbClient.from('menus').select('*').eq('id', targetId).single();
            if (error || !menu) {
                alert('존재하지 않는 메뉴입니다.');
                location.href = 'list.html';
                return;
            }

            // 렌더링
            const content = document.getElementById('detail-content');
            content.innerHTML = `
                <p><strong>ID:</strong> ${menu.id}</p>
                <p><strong>카테고리:</strong> ${menu.category === 'coffee' ? '☕ 커피' : menu.category === 'beverage' ? '🍹 음료' : '🍰 디저트'}</p>
                <p><strong>메뉴명:</strong> ${menu.name}</p>
                <p><strong>가격:</strong> ₩${menu.price.toLocaleString()}</p>
                <p><strong>설명:</strong> ${menu.description || '작성된 설명이 없습니다.'}</p>
            `;

            document.getElementById('btn-edit').addEventListener('click', () => {
                localStorage.setItem('admin_target_menu_id', menu.id);
                location.href = `edit.html?id=${menu.id}`;
            });

            document.getElementById('btn-delete').addEventListener('click', async () => {
                if(confirm(`[${menu.name}] 메뉴를 정말 삭제하시겠습니까?`)) {
                    try {
                        const { error } = await window.sbClient.from('menus').delete().eq('id', menu.id);
                        if (error) throw error;
                        alert('삭제되었습니다.');
                        location.href = 'list.html';
                    } catch(e) {
                        console.error(e);
                        alert('삭제 중 에러 발생: ' + e.message);
                    }
                }
            });
        } catch(e) {
            console.error(e);
            alert('메뉴 정보를 불러오는 중 에러 발생');
        }
    }

    loadMenu();

});
