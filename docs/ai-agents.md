# Bộ AI Agent cho viết & review test

_Dành cho team QA automation của Clearer.io._

**Nguyên tắc vàng:** AI **soạn nháp**, con người **phán đoán**. Ba agent dưới đây tăng
tốc phần cơ học, nhưng người mở PR chịu trách nhiệm cuối cùng. Kỹ năng đáng giá nhất bạn
cần rèn là **đọc và bắt lỗi** một test.

Ba agent **do team tự viết**, **portable** (dùng được cho mọi project): chúng đọc
[`TESTING-STANDARD.md`](../TESTING-STANDARD.md) (**kỷ luật E2E phổ quát**, portable) và
`CLAUDE.md` của project hiện tại (**luật đặc thù**) — **luật của project thắng khi có
khác biệt**.

## Ba agent

| Agent             | Lệnh           | Dùng khi                                  | Quyền            |
| ----------------- | -------------- | ----------------------------------------- | ---------------- |
| **test-author**   | `/new-test`    | Viết test mới cho một scenario bất kỳ     | Đọc + ghi + chạy |
| **test-reviewer** | `/review-test` | Soi 1 test/diff theo luật trước khi mở PR | **Read-only**    |
| **test-healer**   | `/heal-tests`  | Test đỏ, cần fix đúng gốc                 | Đọc + sửa + chạy |

> **Ghi chú (đã gộp):** `test-reviewer` **chính là** năng lực _"review-against-rules"_
> (workstream B của Giai đoạn 1). Ta **gộp** nó vào agent này, **không** tạo skill riêng
> — tránh trùng vai trò.

## Phạm vi không bị giới hạn

Click, điền form, điều hướng, keyboard, upload, API, visual... **đều được**. Kỷ luật nằm
ở **cách viết** (POM, no-sleep, web-first assertion, message rõ, negative-path...), chứ
**không** ở loại thao tác hay domain. Agent không ép bạn theo một kiểu test nào.

## Dùng theo bậc (để năng lực đi lên, không để AI làm hộ)

1. **Học đọc:** nhờ `test-reviewer` giải thích từng luật nó kiểm (xem
   [`CLAUDE.md`](../CLAUDE.md) và [`learn-playwright.md`](learn-playwright.md)).
2. **Tự viết, AI soi:** bạn viết test → `/review-test` → sửa theo góp ý.
3. **AI viết, BẠN soi (quan trọng nhất):** `/new-test` ra bản nháp → **tự bạn** đối
   chiếu `CLAUDE.md` xem có vi phạm gì _trước khi_ tin nó. Đây là kỹ năng đích.
4. **Điều phối:** test đỏ → `/heal-tests`; mở PR → luôn chạy `/review-test`.

> ⚠️ **Cạm bẫy:** biến mình thành "người bấm nút" — merge test AI mà không đọc. Một test
> xanh nhưng sai còn nguy hiểm hơn không có test, vì nó tạo cảm giác an toàn giả.

## Vì sao ta tự viết, không mượn agent generic

- **Portable + constitution-native:** agent đọc `CLAUDE.md` của từng project, nên nhân
  bản sang domain khác vẫn đúng luật nơi đó.
- **Safety-net-first:** `test-healer` **không bao giờ** dùng sleep / skip / nới assertion
  để ép test xanh; gặp bug thật thì báo, không giấu.
- **Human-judgment-first:** có hẳn `test-reviewer` read-only để rèn phán đoán, thay vì để
  AI vừa viết vừa tự duyệt.

---

_Định nghĩa agent ở [`.claude/agents/`](../.claude/agents), lệnh ở
[`.claude/commands/`](../.claude/commands). Kỷ luật phổ quát nằm ở
[`TESTING-STANDARD.md`](../TESTING-STANDARD.md); luật đặc thù của mỗi project nằm trong
`CLAUDE.md` của project đó. Khi fan-out: copy `.claude/` **và** `TESTING-STANDARD.md`
sang project mới._
