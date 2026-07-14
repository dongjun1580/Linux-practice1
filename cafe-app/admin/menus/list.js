document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('admin-menu-list');
    let menus = [];

    async function fetchMenus() {
        try {
            const { data, error } = await window.sbClient.from('menus').select('*').order('id', { ascending: true });
            if (error) throw error;
            menus = data || [];
            localStorage.setItem('cafe_menus', JSON.stringify(menus));
            render();
        } catch(e) {
            console.error(e);
        }
    }

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
                    <button class="action-btn btn-view" onclick="goToDetail('${menu.id}')">상세</button>
                    <button class="action-btn btn-edit" onclick="goToEdit('${menu.id}')">수정</button>
                    <button class="action-btn btn-delete" onclick="deleteMenu('${menu.id}')">삭제</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.deleteMenu = async (id) => {
        if(confirm('정말 삭제하시겠습니까?')) {
            try {
                const { error } = await window.sbClient.from('menus').delete().eq('id', id);
                if (error) throw error;
                await fetchMenus();
            } catch (e) {
                console.error(e);
                alert('삭제 중 에러 발생: ' + e.message);
            }
        }
    };

    window.goToDetail = (id) => {
        localStorage.setItem('admin_target_menu_id', id);
        location.href = 'detail.html?id=' + id;
    };

    window.goToEdit = (id) => {
        localStorage.setItem('admin_target_menu_id', id);
        location.href = 'edit.html?id=' + id;
    };

    fetchMenus();
});
