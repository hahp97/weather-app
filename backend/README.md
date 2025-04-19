# Weather Report System Backend

Backend API cho hệ thống báo cáo thời tiết Changi Airport, cung cấp các API để lấy dữ liệu thời tiết, tạo báo cáo, và quản lý người dùng.

## Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
yarn install

# Tạo file .env từ .env.example và cập nhật các biến môi trường
cp .env.example .env

# Chạy migration và tạo database
npx prisma generate

# Chạy server ở môi trường development
yarn dev
```

## Hệ thống xác thực và phân quyền người dùng

### Loại người dùng

Hệ thống có hai loại người dùng:

1. **Admin (superAdmin = true)**

   - Có quyền quản lý toàn bộ người dùng và báo cáo trong hệ thống
   - Có thể tạo tài khoản admin khác
   - Truy cập và quản lý tất cả báo cáo thời tiết

2. **User thường (superAdmin = false)**
   - Có thể tạo và xem báo cáo thời tiết cá nhân
   - Quản lý thông tin cá nhân
   - Không có quyền truy cập tài nguyên của người dùng khác

### Luồng xác thực (Authentication Flow)

#### Đăng ký tài khoản (User Self-Registration)

1. Người dùng điền thông tin đăng ký gồm: email, username, password, name và số điện thoại
2. Backend kiểm tra email và username đã tồn tại chưa
3. Nếu chưa tồn tại, tạo tài khoản người dùng mới với quyền user thường (superAdmin = false)
4. Gửi email xác thực đến địa chỉ email đã đăng ký
5. Người dùng nhấp vào link xác thực email để hoàn tất quá trình đăng ký
6. Hệ thống cập nhật trạng thái isEmailVerified = true

```graphql
mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) {
    success
    message
    errors {
      message
      field
    }
  }
}
```

#### Xác thực email

1. Người dùng nhấp vào link trong email xác thực
2. Frontend chuyển hướng đến trang xác thực với token
3. Frontend gọi API xác thực email với token

```graphql
query VerifyEmail($token: String!) {
  verifyEmail(token: $token) {
    success
    message
  }
}
```

#### Đăng nhập

1. Người dùng nhập email/username và password
2. Backend xác thực thông tin và trả về JWT token và refresh token
3. Frontend lưu token và sử dụng cho các yêu cầu API tiếp theo

```graphql
mutation SignIn($identifier: String!, $password: String!) {
  signIn(identifier: $identifier, password: $password) {
    success
    message
    token
    refreshToken
    errors {
      message
    }
  }
}
```

#### Quên mật khẩu

1. Người dùng nhập email để yêu cầu đặt lại mật khẩu
2. Backend gửi email với link đặt lại mật khẩu
3. Người dùng nhấp vào link và đặt mật khẩu mới

```graphql
mutation ForgotPassword($email: String!, $callbackUrl: String!) {
  forgotPassword(email: $email, callbackUrl: $callbackUrl) {
    success
    message
  }
}
```

#### Đặt lại mật khẩu

```graphql
mutation ResetPassword($code: String!, $newPassword: String!, $callbackUrl: String!) {
  resetPassword(code: $code, newPassword: $newPassword, callbackUrl: $callbackUrl) {
    success
    message
  }
}
```

### Quyền và chức năng

#### Chức năng chung

| Chức năng                  | Admin | User thường |
| -------------------------- | ----- | ----------- |
| Đăng nhập                  | ✅    | ✅          |
| Đăng ký tài khoản          | ✅    | ✅          |
| Quên mật khẩu              | ✅    | ✅          |
| Xem thông tin cá nhân      | ✅    | ✅          |
| Cập nhật thông tin cá nhân | ✅    | ✅          |

#### Chức năng báo cáo thời tiết

| Chức năng                  | Admin | User thường               |
| -------------------------- | ----- | ------------------------- |
| Xem thời tiết hiện tại     | ✅    | ✅                        |
| Tạo báo cáo thời tiết      | ✅    | ✅                        |
| Xem báo cáo của mình       | ✅    | ✅                        |
| Xem báo cáo của người khác | ✅    | ❌                        |
| So sánh báo cáo            | ✅    | ✅ (chỉ báo cáo của mình) |

#### Chức năng quản lý người dùng

| Chức năng                     | Admin | User thường |
| ----------------------------- | ----- | ----------- |
| Xem danh sách người dùng      | ✅    | ❌          |
| Tạo tài khoản (cả admin)      | ✅    | ❌          |
| Tắt/bật tài khoản             | ✅    | ❌          |
| Cập nhật thông tin người dùng | ✅    | ❌          |

### Bảo mật

- JWT tokens được sử dụng cho xác thực API
- Tokens có thời gian sống giới hạn (access token: 4 ngày, refresh token: 7 ngày)
- Mật khẩu được mã hóa trước khi lưu vào database
- API rate limiting để ngăn chặn tấn công brute force
- Email xác thực cho đăng ký tài khoản và đặt lại mật khẩu

## API GraphQL

Backend cung cấp API GraphQL tại endpoint `/graphql` với các queries và mutations chính:

### Weather API

- `currentWeather`: Lấy dữ liệu thời tiết hiện tại
- `generateWeatherReport`: Tạo báo cáo thời tiết
- `weatherReports`: Lấy danh sách báo cáo thời tiết
- `compareWeatherReports`: So sánh hai báo cáo thời tiết

### User API

- `signUp`: Đăng ký tài khoản mới
- `signIn`: Đăng nhập
- `me`: Lấy thông tin người dùng hiện tại
- `updateProfile`: Cập nhật thông tin cá nhân
- `users`: Lấy danh sách người dùng (chỉ admin)
- `createUser`: Tạo tài khoản người dùng (chỉ admin)

## Cấu trúc thư mục

```
backend/
│
├── prisma/          # Prisma schema và migrations
├── src/
│   ├── api/         # API clients (OpenWeather)
│   ├── configs/     # Cấu hình ứng dụng
│   ├── constants/   # Các hằng số
│   ├── database/    # Kết nối database và services
│   ├── graphql/     # GraphQL schema và resolvers
│   ├── helpers/     # Các hàm helper
│   ├── jobs/        # Background jobs (email, weather fetcher)
│   ├── libs/        # Thư viện (auth, etc.)
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Các hàm tiện ích
│   ├── validators/  # Zod validators
│   └── index.ts     # Entry point
```
