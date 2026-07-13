// auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const errorMsg = document.getElementById('error-message');

    // 로그인 처리
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.textContent = '';
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Supabase Auth SignIn API 호출
            const { data, error } = await window.sbClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                errorMsg.textContent = '로그인 실패: 이메일이나 비밀번호를 확인해주세요.';
                console.error(error);
            } else {
                alert('로그인 성공!');
                // 로그인 완료 후 메인 페이지로 이동
                location.href = '../index.html';
            }
        });
    }

    // 회원가입 처리
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.textContent = '';
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('password-confirm').value;

            if (password !== confirmPassword) {
                errorMsg.textContent = '비밀번호가 일치하지 않습니다.';
                return;
            }

            // Supabase Auth SignUp API 호출
            const { data, error } = await window.sbClient.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                errorMsg.textContent = `회원가입 실패: ${error.message}`;
                console.error(error);
            } else {
                alert('회원가입 성공! 메인 페이지로 이동합니다.');
                // 가입 완료 후 메인 페이지로 이동
                location.href = '../index.html';
            }
        });
    }
});
