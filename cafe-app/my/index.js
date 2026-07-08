document.addEventListener('DOMContentLoaded', () => {
    // 1. 로컬 스토리지 데이터 초기화 및 불러오기
    let userProfile = JSON.parse(localStorage.getItem('cafe_user')) || {
        nickname: '따뜻한 라떼 한잔',
        grade: '골드 멤버스',
        stamps: 6 // 테스트용 기본 스탬프 개수
    };

    const orders = JSON.parse(localStorage.getItem('cafe_orders')) || [];

    // DOM 요소 가져오기
    const nicknameEl = document.getElementById('user-nickname');
    const gradeEl = document.getElementById('user-grade');
    const stampActiveEl = document.getElementById('stamp-active');
    const stampGrid = document.getElementById('stamp-grid');
    const totalOrdersEl = document.getElementById('total-orders-count');
    const nicknameInput = document.getElementById('nickname-input');

    // 2. 화면에 기본 데이터 렌더링
    function renderProfile() {
        nicknameEl.textContent = userProfile.nickname;
        gradeEl.textContent = userProfile.grade;
        stampActiveEl.textContent = userProfile.stamps;
        totalOrdersEl.textContent = `${orders.length}건`;
        nicknameInput.value = userProfile.nickname;
        
        renderStamps(userProfile.stamps);
    }

    // 3. 스탬프 그리드 동적 생성 (10개 기준)
    function renderStamps(count) {
        stampGrid.innerHTML = ''; // 초기화
        for (let i = 1; i <= 10; i++) {
            const stamp = document.createElement('div');
            if (i <= count) {
                stamp.className = 'stamp-item active';
                stamp.textContent = '☕'; // 찍힌 스탬프
            } else {
                stamp.className = 'stamp-item';
                stamp.textContent = i; // 안 찍힌 스탬프 빈자리
            }
            stampGrid.appendChild(stamp);
        }
    }

    // 4. 프로필(닉네임) 수정 이벤트
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newNickname = nicknameInput.value.trim();
        if (newNickname) {
            userProfile.nickname = newNickname;
            localStorage.setItem('cafe_user', JSON.stringify(userProfile));
            
            alert('닉네임이 성공적으로 변경되었습니다! ✨');
            renderProfile();
        }
    });

    // 최초 실행
    renderProfile();
});