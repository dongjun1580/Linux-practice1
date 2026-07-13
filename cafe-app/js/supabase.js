const SUPABASE_URL = 'https://ncniibpcwapamraxncch.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbmlpYnBjd2FwYW1yYXhuY2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MjA5MzIsImV4cCI6MjA5OTQ5NjkzMn0.SE4xJYVtZ-CGXtQ8Fea3A_ev2mbEPj2N_dkC5pzZAHA';

// Supabase 클라이언트 초기화
// (index.html에서 CDN 스크립트가 먼저 로드되어야 합니다)
window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 테스트용: 연결 상태 확인 (브라우저 콘솔에서 확인 가능)
console.log("Supabase 연동 완료:", window.sbClient);
