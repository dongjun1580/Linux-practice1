# ☕ 카페 앱 데이터베이스 구조 (현재 구현 및 향후 Supabase 반영)

지금까지 구현한 **회원가입/로그인(Auth + Profiles)** 구조와, 현재 로컬 스토리지에 있는 데이터를 **Supabase DB로 옮기기 위해** 정리한 최신 ERD입니다.

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK "Supabase 기본 로그인 고유키"
        string email "로그인 이메일"
    }

    PROFILES {
        uuid id PK, FK "유저 고유키 (AUTH_USERS 연결)"
        string email "가입 이메일"
        string role "권한 ('customer' 또는 'admin')"
        string nickname "닉네임"
        string grade "멤버십 등급"
        integer stamps "보유 스탬프 개수"
    }

    COUPONS {
        uuid id PK "쿠폰 고유키"
        uuid user_id FK "소유자 고유키"
        string name "쿠폰명"
        boolean is_used "사용 여부"
        timestamp expires_at "만료 일시"
        timestamp used_at "사용 일시"
        timestamp created_at "발급 일시"
    }

    MENUS {
        string id PK "메뉴 고유 아이디 (예: 'm1')"
        string category "카테고리 (coffee, dessert 등)"
        string name "메뉴명"
        integer price "가격"
        string description "설명"
        string img "이미지 URL"
        boolean isNew "신메뉴 여부"
        boolean isBest "베스트 여부"
    }

    ORDERS {
        string id PK "주문 고유 아이디"
        uuid user_id FK "주문한 회원의 고유키 (비회원이면 null)"
        string userName "주문자명 (또는 이메일 앞자리)"
        integer totalPrice "총 결제 금액"
        string status "주문 상태 (준비 중, 준비 완료, 수령 완료)"
        timestamp date "주문 일시"
    }

    ORDER_ITEMS {
        string id PK "상세 내역 고유 아이디"
        string order_id FK "어느 주문에 속하는지"
        string menu_id FK "어떤 메뉴인지"
        integer quantity "수량"
        jsonb options "선택한 옵션 (사이즈, 얼음, 샷 등)"
    }

    %% 관계선 정의
    AUTH_USERS ||--|| PROFILES : "회원가입 시 프로필 자동 생성"
    PROFILES ||--o{ ORDERS : "회원이 주문함 (1:N)"
    PROFILES ||--o{ COUPONS : "회원이 쿠폰을 소유함 (1:N)"
    ORDERS ||--|{ ORDER_ITEMS : "주문서 안에 여러 메뉴 담김 (1:N)"
    MENUS ||--o{ ORDER_ITEMS : "어떤 메뉴가 주문되었는지 연결 (1:N)"
```

### 💡 주요 변경 및 업데이트 내용
1. **`AUTH_USERS` 및 `PROFILES` 추가**: 오늘 추가한 회원가입 시스템과 권한(role) 관리 구조를 정확히 반영했습니다.
2. **주문자 정보(`userName`, `user_id`) 추가**: 주문(ORDERS) 테이블에 누가 주문했는지 알 수 있도록 주문자 컬럼을 넣었습니다.
3. **옵션(options) 추가**: 장바구니에서 사용하는 샷 추가, 얼음 양 등의 커스텀 옵션 데이터를 `ORDER_ITEMS`에 JSON 형태로 저장할 수 있게 반영했습니다.
4. **스탬프 및 쿠폰 시스템 추가 (Supabase)**: `PROFILES` 테이블에 `stamps`, `grade`, `nickname` 컬럼을 추가하고, 발급된 무료 쿠폰을 관리하기 위한 `COUPONS` 테이블을 새롭게 연결했습니다.
