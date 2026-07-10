document.getElementById('create-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('menuId').value.trim();
    const category = document.getElementById('menuCategory').value;
    const name = document.getElementById('menuName').value.trim();
    const price = parseInt(document.getElementById('menuPrice').value, 10);
    const description = document.getElementById('menuDesc').value.trim();

    let menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];
    
    if(menus.find(m => m.id === id)) {
        alert('이미 존재하는 ID입니다. 다른 ID를 입력해주세요.');
        return;
    }

    menus.push({ id, category, name, price, description });
    localStorage.setItem('cafe_menus', JSON.stringify(menus));
    
    alert('새 메뉴가 성공적으로 추가되었습니다.');
    location.href = 'list.html';
});
