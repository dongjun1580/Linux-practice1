document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('menuId').value.trim();
    const category = document.getElementById('menuCategory').value;
    const name = document.getElementById('menuName').value.trim();
    const price = parseInt(document.getElementById('menuPrice').value, 10);
    const description = document.getElementById('menuDesc').value.trim();

    try {
        // ID 중복 체크 (DB에서 조회)
        const { data: existing } = await window.sbClient.from('menus').select('id').eq('id', id).single();
        if(existing) {
            alert('이미 존재하는 ID입니다. 다른 ID를 입력해주세요.');
            return;
        }
    } catch(err) {
        // No match found is expected behavior, so we continue
    }

    try {
        const { error } = await window.sbClient.from('menus').insert([{
            id, category, name, price, description
        }]);

        if (error) throw error;

        alert('새 메뉴가 성공적으로 추가되었습니다.');
        location.href = 'list.html';
    } catch (error) {
        console.error(error);
        alert('DB 추가 중 에러 발생: ' + error.message);
    }
});
