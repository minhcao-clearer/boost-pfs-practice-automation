# Locator Strategy Guideline — Playwright
### (Dành cho người mới bắt đầu Automation)

*Áp dụng cho các tất cả các projects của Clearer.io*

## 0. Locator là gì? (đọc trước nếu bạn mới bắt đầu)

Khi test manual, bạn "tìm" một nút hay một ô input bằng mắt rồi click chuột vào.
Khi viết automation, Playwright cũng cần "tìm" đúng element đó — nhưng nó không nhìn bằng mắt, nó tìm bằng cách đọc **mã HTML** đứng sau giao diện.

**Locator = cách bạn chỉ cho Playwright biết "hãy tìm đúng cái này".**

Ví dụ, nút "Đăng nhập" bạn thấy trên màn hình thực ra được viết trong code kiểu:
```html
<button id="login-btn" class="btn-primary">Đăng nhập</button>
```

Playwright có nhiều cách để "chỉ" vào nút này — dùng role của nó, dùng text hiển thị, dùng id, dùng class... Guideline này giúp bạn chọn **cách nào nên dùng trước, cách nào nên tránh**, để test không bị vỡ khi dev sửa giao diện.

> Vì sao chuyện này quan trọng? Vì có những cách "chỉ" rất chắc chắn (như dựa vào text người dùng thấy), và có cách rất mong manh (như đếm vị trí thứ mấy trong danh sách — dev chỉ cần thêm 1 dòng là sai hết).

## 1. Mục tiêu

- Test **ổn định**, ít bị vỡ khi dev đổi giao diện.
- Người mới trong team đọc lại test case cũ vẫn hiểu ngay, không cần đoán.
- Cả team viết theo cùng 1 chuẩn, dù đang làm project nào.

## 2. Thứ tự ưu tiên khi chọn locator

**Luật đơn giản: thử từ trên xuống, dùng cái đầu tiên khả thi.** Đừng nhảy thẳng xuống dưới vì "quen tay" — dòng càng ở trên càng ổn định và dễ đọc.

### 1️⃣ `getByRole` — ưu tiên số 1
Tìm theo "vai trò" của element (button, link, checkbox, heading...) — giống như cách người dùng khiếm thị dùng screen reader để nghe và biết đây là nút gì.

HTML thực tế trên trang trông như vầy:
```html
<button>Submit</button>
```

Playwright sẽ tìm nó bằng:
```javascript
page.getByRole('button', { name: 'Submit' })
```

Dùng khi: element là button, link, checkbox, radio, heading... (hầu hết trường hợp).

### 2️⃣ `getByLabel` / `getByPlaceholder`
Tìm ô input dựa theo label hoặc placeholder — giống bạn tìm ô "Email" bằng cách đọc chữ ghi cạnh ô đó.

HTML thực tế trên trang trông như vầy:
```html
<label for="email-input">Email</label>
<input id="email-input" type="text" placeholder="you@example.com" />
```

Playwright sẽ tìm nó bằng:
```javascript
page.getByLabel('Email')
// hoặc nếu không có label, dựa vào placeholder:
page.getByPlaceholder('you@example.com')
```

Dùng khi: đang thao tác với form (nhập email, mật khẩu, số điện thoại...).

### 3️⃣ `getByText`
Tìm theo đúng chữ hiển thị trên màn hình.

HTML thực tế trên trang trông như vầy:
```html
<div class="toast-success">Đăng nhập thành công</div>
```

Playwright sẽ tìm nó bằng:
```javascript
page.getByText('Đăng nhập thành công')
```

Dùng khi: bạn cần verify một thông báo, toast, hoặc dòng chữ cụ thể xuất hiện.

### 4️⃣ `data-testid`
Một "mã định danh" riêng mà dev gắn thêm vào code chỉ để phục vụ test (không hiển thị cho người dùng thấy).

HTML thực tế trên trang trông như vầy:
```html
<button data-testid="checkout-submit">🛒</button>
```

Playwright sẽ tìm nó bằng:
```javascript
page.getByTestId('checkout-submit')
```

Dùng khi: element không có role/text rõ ràng để bám vào (ví dụ icon không có chữ). Nếu team đang thiếu testid ở đâu, đây là lúc nên nhờ dev bổ sung thay vì tự đi vòng bằng XPath.

### 5️⃣ CSS selector
Tìm theo class hoặc id trong code — giống cách bạn nhận diện 1 người qua tên áo họ mặc.

HTML thực tế trên trang trông như vầy:
```html
<span class="product-card__price">$19.99</span>
```

Playwright sẽ tìm nó bằng:
```javascript
page.locator('.product-card__price')
```

Dùng khi: không có testid, nhưng class đó ổn định và có ý nghĩa rõ ràng (không phải class do framework tự sinh random).

### 6️⃣ XPath — dùng sau cùng, khi các cách trên không đủ
Xem chi tiết ở mục 3 bên dưới, vì XPath phức tạp hơn và cần hiểu kỹ trước khi dùng.

## 3. XPath là gì và khi nào mới cần dùng

**XPath giống như chỉ đường theo địa chỉ nhà**, thay vì gọi tên người: "đi tới cái bảng nào có ô ghi chữ 'Error', rồi từ ô đó đi ngược lên hàng chứa nó."

Điểm mạnh duy nhất của XPath mà các cách trên không làm được: **đi ngược lên "cha" (parent) hoặc sang "hàng xóm" (sibling)** trong cấu trúc trang. Ví dụ: bạn thấy chữ "Error" trong 1 ô, và muốn bấm nút Delete nằm cùng hàng (row) với ô đó — đây là lúc XPath axes (`ancestor::`, `following-sibling::`...) phát huy tác dụng.

HTML thực tế trên trang trông như vầy — chú ý chữ "Error" và nút "Delete" nằm cách xa nhau, không phải cha-con trực tiếp, mà là 2 ô cùng nằm trong 1 hàng `<tr>`:
```html
<table>
  <tr>
    <td>Error</td>
    <td><button>Delete</button></td>
  </tr>
</table>
```

Playwright sẽ tìm nó bằng cách: xuất phát từ ô có chữ "Error", leo ngược lên hàng `<tr>` chứa nó, rồi từ hàng đó tìm xuống nút Delete:
```javascript
// Tìm hàng chứa "Error", rồi bấm nút Delete trong chính hàng đó
page.locator('xpath=//td[normalize-space(text())="Error"]/ancestor::tr')
    .locator('button:has-text("Delete")');
```

**Chỉ dùng XPath khi:**
- Cần đi ngược lên cha/hàng-ngang mà không có testid nào để bám.
- Không có `data-testid`, không có `aria-label`, chữ hiển thị hay đổi (do dịch ngôn ngữ, do nội dung động).

**Tuyệt đối tránh:**
- XPath dạng "đường đi tuyệt đối" copy từ DevTools, ví dụ `/html/body/div[1]/div[2]/button` — chỉ cần dev thêm 1 div là sai hết ngay. Nếu thấy XPath bắt đầu bằng `/html/body/...`.
- Dùng XPath cho việc mà `getByRole`/`getByText` đã làm được gọn hơn.

**Nếu bắt buộc phải viết XPath**, nhớ 3 điều:
1. Luôn bắt đầu bằng `//` (tìm ở mọi cấp), không bắt đầu bằng `/html/...`.
2. Thêm 1 dòng comment ngắn giải thích lý do — để người review và người đọc sau hiểu vì sao không dùng cách thường được.
3. Nếu text hay đổi, dùng `contains()` hoặc `normalize-space()` thay vì so khớp cứng.

## 4. So sánh XPath vs CSS vs Playwright locator

| Tiêu chí | XPath | CSS | Playwright locator (getByRole, getByText...) |
|---|---|---|---|
| Đi theo parent/sibling | Có | Không (trừ sibling `+`, `~`) | Không trực tiếp |
| Text matching | Có, mạnh | Không | Có, rất mạnh |
| Độ dễ đọc | Khó hơn | Dễ | Dễ nhất |
| Độ ổn định (ít vỡ) | Thấp nếu absolute | Trung bình | Cao (semantic) |
| Hiệu năng | Chậm hơn CSS | Nhanh | Nhanh |

Nhìn vào bảng dễ thấy: XPath chỉ thắng ở khoản "đi theo parent/sibling" và "text matching mạnh" — còn lại thì Playwright locator (`getByRole`, `getByText`...) đều tốt hơn hoặc ngang bằng. Đây là lý do guideline luôn xếp XPath xuống cuối cùng trong thứ tự ưu tiên ở mục 2.

## 5. Vài lỗi thường gặp khi mới chuyển từ Manual sang Automation

- **Tìm locator qua vị trí (index)** kiểu "phần tử thứ 3 trong danh sách" — rất dễ vỡ nếu danh sách đổi thứ tự. Ưu tiên tìm theo nội dung/role thay vì vị trí.
- **Copy nguyên XPath từ DevTools** mà không rút gọn — thường ra absolute path rất dễ vỡ.
- **Dùng text tiếng Việt/Anh cứng nhắc** để tìm element khi nội dung có thể đổi theo bản dịch — nên hỏi dev thêm `data-testid` nếu nội dung không cố định.
- **Không biết dùng `filter({ has })`** để tìm 1 khối chứa nội dung con cụ thể — dùng cách này trước khi nghĩ tới XPath ancestor.

---
*Guideline này viết cho người mới bắt đầu automation. Nếu có thuật ngữ nào chưa rõ, hỏi lead hoặc người review PR — đừng ngại hỏi, ai cũng bắt đầu từ manual cả.*
