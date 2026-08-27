# Test plan — luồng filter

File này dùng để luyện **Stage Selected Lines**. Hai mục cần sửa nằm xa nhau
(mục 2 và mục 11) nên Git sẽ tách chúng thành hai khối diff riêng.

## Danh sách test case

1. Mở collection, kiểm tra danh sách sản phẩm hiển thị đầy đủ.

2. Filter theo màu Blue, kiểm tra mọi sản phẩm trả về đều có màu Blue. — TODO: bổ sung ghi chú về Multi Color

3. Filter theo màu Red, kiểm tra tương tự.

4. Filter theo khoảng giá 0–50, kiểm tra giá nằm trong khoảng.

5. Filter theo khoảng giá 50–100, kiểm tra tương tự.

6. Kết hợp màu và giá, kiểm tra cả hai điều kiện.

7. Filter không ra kết quả, kiểm tra thông báo trống hiển thị đúng.

8. Bỏ filter, kiểm tra danh sách trở về đầy đủ.

9. Filter rồi refresh trang, kiểm tra filter còn giữ.

10. Filter rồi bấm back, kiểm tra trạng thái trước đó.

11. Phân trang khi đang filter, kiểm tra filter giữ nguyên qua các trang. — TODO: bổ sung số trang cụ thể

12. Filter trên mobile viewport, kiểm tra modal filter mở được.
