document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('admin-menu-list');
    let menus = JSON.parse(localStorage.getItem('cafe_menus')) || [];

    function render() {
        tbody.innerHTML = '';
        if(menus.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">등록된 메뉴가 없습니다.</td></tr>';
            return;
        }
        menus.forEach(menu => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${menu.id}</td>
                <td>${menu.category}</td>
                <td>${menu.name}</td>
                <td>₩${menu.price.toLocaleString()}</td>
                <td>
                    <button class="action-btn btn-view" onclick="location.href='detail.html?id=${menu.id}'">상세</button>
                    <button class="action-btn btn-edit" onclick="location.href='edit.html?id=${menu.id}'">수정</button>
                    <button class="action-btn btn-delete" onclick="deleteMenu('${menu.id}')">삭제</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.deleteMenu = (id) => {
        if(confirm('정말 삭제하시겠습니까?')) {
            menus = menus.filter(m => m.id !== id);
            localStorage.setItem('cafe_menus', JSON.stringify(menus));
            render();
        }
    };

    render();
});
