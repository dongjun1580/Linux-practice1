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
            const { data, error } = await window.sbClient.from('menus').select('*').eq('id', targetId).single();
            if (error || !data) {
                alert('존재하지 않는 메뉴입니다.');
                location.href = 'list.html';
                return;
            }
            
            // 기존 데이터 폼에 채우기
            document.getElementById('menuId').value = data.id;
            document.getElementById('menuCategory').value = data.category;
            document.getElementById('menuName').value = data.name;
            document.getElementById('menuPrice').value = data.price;
            document.getElementById('menuDesc').value = data.description || '';
        } catch(e) {
            console.error(e);
            alert('메뉴 정보를 불러오는 중 에러 발생');
        }
    }
    loadMenu();

    // 수정 이벤트
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedMenu = {
            category: document.getElementById('menuCategory').value,
            name: document.getElementById('menuName').value.trim(),
            price: parseInt(document.getElementById('menuPrice').value, 10),
            description: document.getElementById('menuDesc').value.trim()
        };

        try {
            const { error } = await window.sbClient.from('menus').update(updatedMenu).eq('id', targetId);
            if (error) throw error;
            
            alert('성공적으로 수정되었습니다.');
            location.href = `detail.html?id=${targetId}`;
        } catch(e) {
            console.error(e);
            alert('수정 중 에러 발생: ' + e.message);
        }
    });
});
