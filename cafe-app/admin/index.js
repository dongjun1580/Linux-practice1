// 대시보드 스크립트
<!DOCTYPE html>
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = '<p>대시보드 데이터가 여기에 로드됩니다.</p>';
});
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대시보드</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <h1>관리자 대시보드</h1>
    <div id="dashboard">
        <p>여기에 대시보드 내용이 표시됩니다.</p>
    </div>
    <script src="index.js"></script>
</body>
</html>

