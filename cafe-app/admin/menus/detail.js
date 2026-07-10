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
        location.href = `edit.html?id=${menu.id}`;
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        if(confirm(`[${menu.name}] 메뉴를 정말 삭제하시겠습니까?`)) {
            menus = menus.filter(m => m.id !== menu.id);
            localStorage.setItem('cafe_menus', JSON.stringify(menus));
            alert('삭제되었습니다.');
            location.href = 'list.html';
        }
    });
});
