# Hệ thống Job trong Weather Report Backend

Hệ thống job trong ứng dụng Weather Report được thiết kế để xử lý các tác vụ nền và tác vụ theo lịch trình. Có hai loại job chính:

## 1. Background Jobs

Background jobs là các tác vụ chạy theo lịch trình định kỳ trên server. Các job này được quản lý bởi `BackgroundJobManager`.

### Cấu trúc

```
background/
├── baseJob.ts           - Lớp cơ sở cho tất cả background jobs
├── weatherDataFetcher.ts - Job lấy dữ liệu thời tiết
├── otpCleanupJob.ts     - Job dọn dẹp OTP hết hạn
└── index.ts             - Manager quản lý tất cả background jobs
```

### Các Jobs hiện có

- **WeatherDataFetcher**: Lấy dữ liệu thời tiết từ OpenWeatherMap API mỗi 5 phút
- **OTPCleanupJob**: Dọn dẹp các mã OTP đã hết hạn mỗi 15 phút

### Cách thêm Background Job mới

1. Tạo một class mới kế thừa từ `BaseBackgroundJob`
2. Override phương thức `executeJob()`
3. Đăng ký job trong `background/index.ts`

Ví dụ:

```typescript
import { BaseBackgroundJob } from "./baseJob";

export class MyNewJob extends BaseBackgroundJob {
  constructor(intervalMinutes = 10) {
    super("MyNewJob", intervalMinutes);
  }

  protected async executeJob(): Promise<void> {
    // Logic của job
  }
}
```

## 2. Mailer Jobs

Mailer jobs phục vụ việc gửi email theo yêu cầu, quản lý bởi hệ thống queue.

### Cấu trúc

```
mailer/
├── templates/           - Chứa các template email dạng EJS
│   ├── otp-verification-email.ejs
│   ├── password-reset-email.ejs
│   └── ...
└── index.ts             - EmailJob class xử lý gửi email
```

### Các Template email hiện có

- **otp-verification-email**: Gửi mã OTP xác thực
- **password-reset-email**: Gửi liên kết reset password
- **password-reset-confirmation-email**: Xác nhận đã reset password
- **user-credentials-email**: Gửi thông tin tài khoản mới

### Cách sử dụng Email Job

```typescript
import jobs from "@/jobs";

jobs.perform(
  { id: "email-job" },
  {
    email: "tên-template", // ví dụ: "otp-verification-email"
    subject: "Tiêu đề email",
    to: "người_nhận@example.com",
    // Các dữ liệu khác cần cho template
    otp: "123456",
  }
);
```

### Cách tạo Template Email mới

1. Tạo file `.ejs` trong thư mục `mailer/templates/`
2. Sử dụng cú pháp EJS để tạo template
3. Sử dụng các biến được truyền vào từ `jobs.perform()`

## Quản lý Job

Tất cả jobs được quản lý bởi `JobManager` cung cấp API thống nhất cho việc thực thi các job.

```typescript
import jobs, { backgroundJobs } from "@/jobs";

// Thực thi một job theo yêu cầu
jobs.perform(
  { id: "email-job" },
  {
    /* ... */
  }
);

// Quản lý background jobs
backgroundJobs.startAll(); // Khởi động tất cả background jobs
backgroundJobs.stopAll(); // Dừng tất cả background jobs
```

## Configuration

Email settings are configured through environment variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@weatherreport.com
```

For Gmail, you'll need to use an App Password. [Learn more](https://support.google.com/accounts/answer/185833?hl=en)
