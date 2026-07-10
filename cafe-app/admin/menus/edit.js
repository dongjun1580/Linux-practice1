document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get('id');
    
    if(!targetId) {
        alert('잘못된 접근입니다.');
        location.href = 'list.html';
        return;
    }

    let menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];
    const menu = menus.find(m => m.id === targetId);

    if(!menu) {
        alert('존재하지 않는 메뉴입니다.');
        location.href = 'list.html';
        return;
    }

    // 폼 초기 데이터 세팅
    document.getElementById('menuId').value = menu.id;
    document.getElementById('menuCategory').value = menu.category;
    document.getElementById('menuName').value = menu.name;
    document.getElementById('menuPrice').value = menu.price;
    document.getElementById('menuDesc').value = menu.description || '';

    // 수정 이벤트
    document.getElementById('edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        menu.category = document.getElementById('menuCategory').value;
        menu.name = document.getElementById('menuName').value.trim();
        menu.price = parseInt(document.getElementById('menuPrice').value, 10);
        menu.description = document.getElementById('menuDesc').value.trim();

        localStorage.setItem('cafe_menus', JSON.stringify(menus));
        alert('메뉴가 성공적으로 수정되었습니다.');
        location.href = 'list.html';
    });
});
