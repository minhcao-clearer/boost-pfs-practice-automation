# Kế hoạch tích hợp bộ `.claude` mới

_Trạng thái: **chưa bắt đầu**. Tạo ngày 2026-08-02._

## Mục tiêu

Hợp nhất bộ `.claude` xây riêng (15 file, ~1.800 dòng) vào repo này — **không** tạo ra
nguồn luật thứ hai, **không** làm hỏng những gì đang chạy tốt.

**Nguồn:** `/Users/minhcao/Downloads/shopify-automation-test/.claude/`

---

## Rủi ro chính (đọc trước khi làm)

| #      | Rủi ro                                                                                                                                      | Vì sao nguy hiểm                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **R1** | **Luật trùng nguồn.** `rules/*.md` chồng vai với `TESTING-STANDARD.md`, `CLAUDE.md`, `LOCATOR-STRATEGY-GUIDELINE.md`                        | Hai bộ luật song song sẽ **trôi khỏi nhau**. Đây đúng là bệnh đã mất cả session để chữa (README cũ mô tả sai repo). |
| **R2** | **Skill trùng vai.** `review-and-refactor` ↔ `test-reviewer`; `generate-test-case` ↔ `test-author`; `qa-automation-engineer` bao trùm cả bộ | Học viên không biết dùng cái nào → mất tác dụng dạy.                                                                |
| **R3** | **Viết cho repo khác.** Nguồn dùng layout `src/` + `test-cases/`; repo này là `lib/` + `tests/`                                             | Skill sẽ hướng dẫn sai đường dẫn, sai kiến trúc.                                                                    |
| **R4** | **`settings.json` bật Playwright MCP ở chế độ `--headed`**                                                                                  | Mở cửa sổ trình duyệt thật mỗi lần chạy; cần quyết định có phù hợp không.                                           |

**Nguyên tắc xuyên suốt:** _kiến trúc engine/content đã chốt vẫn thắng._ Luật phổ quát ở
[`TESTING-STANDARD.md`](../TESTING-STANDARD.md), luật riêng ở [`CLAUDE.md`](../CLAUDE.md).
Mọi skill/agent phải **đọc 2 file đó**, không mang bản sao luật của riêng mình.

---

## Bước 1 — Đọc & phân loại _(không đụng repo)_

- [ ] Đọc toàn bộ 15 file nguồn
- [ ] Lập bảng: file → công dụng → trùng với cái gì đang có → **quyết định**
- [ ] Quyết định theo 4 nhóm:
  - **ADOPT** — năng lực mới, repo chưa có
  - **RECONCILE** — trùng vai, phải chọn/gộp
  - **MERGE** — nội dung luật, phải **trộn vào** file luật hiện có (không copy thành file mới)
  - **DROP** — chỉ đúng với repo nguồn

**Xong khi:** có bảng phân loại được bạn duyệt. **Không commit gì.**

---

## Bước 2 — Chốt kiến trúc _(quyết định, chưa code)_

- [ ] **R1:** `rules/automation_rules.md` + `playwright_rules.md` → phần nào là _engine_
      (trộn vào `TESTING-STANDARD.md`), phần nào là _content_ (vào `CLAUDE.md`)?
      `locator_strategy.md` → trộn vào `LOCATOR-STRATEGY-GUIDELINE.md`.
      **Kết quả mong muốn: vẫn chỉ 3 file luật, không thêm thư mục `rules/`.**
- [ ] **R2:** với mỗi cặp trùng vai → giữ cái nào? Đổi tên? Gộp?
- [ ] **R4:** Playwright MCP — bật không? `--headed` hay headless?

**Xong khi:** mọi quyết định ghi vào mục _Nhật ký quyết định_ dưới đây.

---

## Bước 3 — Hợp nhất luật _(commit 1)_

- [ ] Trộn nội dung `rules/*` vào 3 file luật hiện có theo quyết định Bước 2
- [ ] **Không** tạo `.claude/rules/`
- [ ] `npm run check` xanh

**Xong khi:** không còn luật nào tồn tại ở 2 nơi.

---

## Bước 4 — Thêm skill KHÔNG trùng vai _(commit 2)_

Ứng viên: `test-data-generator`, `ui-debug-agent`, `smart-locator-agent`,
`generate-test-case`, `generate-automation-from-testcases`.

- [ ] Với từng skill: sửa đường dẫn/kiến trúc cho khớp repo này (`lib/`, `tests/`) — xử lý R3
- [ ] Bắt mỗi skill **đọc `TESTING-STANDARD.md` + `CLAUDE.md`** trước khi làm việc
- [ ] Thêm **từng cái một**, chạy `npm run check` sau mỗi cái
- [ ] Dogfood thật 1 lần → giữ hoặc bỏ

**Xong khi:** mỗi skill mới đã chạy thật ít nhất 1 lần và cho kết quả đúng chuẩn.

---

## Bước 5 — Xử lý phần trùng vai _(commit 3)_

- [ ] Áp quyết định R2 cho `review-and-refactor`, `qa-automation-engineer`
- [ ] Nếu gộp: giữ **một** tên duy nhất cho mỗi vai trò, xoá cái còn lại
- [ ] Cập nhật [`ai-agents.md`](ai-agents.md) — bảng agent/skill phải khớp thực tế

**Xong khi:** mỗi vai trò (viết / soi / chữa / …) có đúng **một** công cụ.

---

## Bước 6 — Chốt & tài liệu hoá _(commit 4)_

- [ ] Cập nhật `ai-agents.md` (danh sách đầy đủ + dùng khi nào)
- [ ] Cập nhật [`ROADMAP.md`](ROADMAP.md)
- [ ] `npm run check` xanh, push, CI xanh

---

## Nhật ký quyết định

_(điền dần khi chốt từng điểm — để sau này biết **vì sao** làm vậy)_

| Ngày | Vấn đề | Quyết định | Lý do |
| ---- | ------ | ---------- | ----- |
|      |        |            |       |

---

## Bảng phân loại

_(điền ở Bước 1)_

| File nguồn | Công dụng | Trùng với | Quyết định |
| ---------- | --------- | --------- | ---------- |
|            |           |           |            |
