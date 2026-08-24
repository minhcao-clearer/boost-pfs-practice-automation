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

## Bước 1 — Đọc & phân loại _(không đụng repo)_ ✅ **XONG**

- [x] Đọc toàn bộ 15 file nguồn
- [x] Lập bảng phân loại (xem cuối file)
- [x] Quyết định theo 4 nhóm:
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

## Bảng phân loại _(kết quả Bước 1)_

### Tin tốt phát hiện khi đọc

1. **Cùng ứng dụng.** `PROJECT_CONTEXT.md` đã trỏ đúng `boost-pfs-demo.myshopify.com/collections/vertical-layout` → **R3 nhẹ hơn dự đoán**: chỉ khác layout thư mục (`src/` vs `lib/`), không khác app.
2. **Bộ mới đã tự áp single-source-of-truth.** Các skill ghi rõ _"defined in rules files — do not duplicate here"_ và trỏ về `rules/`. Nên khi ta trộn luật vào 3 file hiện có, chỉ cần **đổi con trỏ** — cơ học, ít rủi ro.
3. **Nó vá được lỗ hổng của ta.** `playwright_rules` §4 cấm cả `await new Promise(r => setTimeout(...))`. **Đã kiểm chứng: ESLint hiện tại KHÔNG bắt được dạng này** → sleep vẫn lọt. Đây là lợi ích tức thì, độc lập với việc tích hợp.

### A. `rules/` → **MERGE** vào 3 file luật (không tạo `.claude/rules/`)

| Nội dung nguồn                                                                              | Quyết định           | Đi đâu                                                             |
| ------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------ |
| `automation_rules` §2 **Test data unique/traceable** `[prefix]_[test]_[timestamp]_[random]` | ⭐ **ADOPT**         | `TESTING-STANDARD` §6 (ta mới nói "unique data", chưa có format)   |
| `playwright_rules` §2 **Không đoán locator — soi DOM thật**                                 | ⭐ **ADOPT**         | `TESTING-STANDARD` §4 — _đúng bài học từ bug `.boost-sd__product`_ |
| `playwright_rules` §4 cấm `new Promise(setTimeout)`                                         | ⭐ **ADOPT**         | `TESTING-STANDARD` §3 + **thêm ESLint rule**                       |
| `locator_strategy` §3 **Quy trình verify locator (4 bước)**                                 | ⭐ **ADOPT**         | `LOCATOR-STRATEGY-GUIDELINE`                                       |
| `locator_strategy` §2 Stability (unique-in-scope, tránh class hash)                         | **ADOPT**            | `LOCATOR-STRATEGY-GUIDELINE`                                       |
| `automation_rules` §6 "mỗi test ≥1 assertion"                                               | **ADOPT**            | `TESTING-STANDARD` §5                                              |
| `automation_rules` §3 Xoá debug log / code chết trước khi giao                              | **ADOPT**            | `TESTING-STANDARD` §8                                              |
| `automation_rules` §5 Naming (PascalCase Page, kebab-case.spec.ts)                          | **ADOPT (một phần)** | `CLAUDE.md`                                                        |
| `playwright_rules` §1 Viewport 1920×1080 + MCP resize                                       | **ADOPT**            | mục MCP mới (gắn R4)                                               |
| `automation_rules` §4 Không tự xoá file khi chưa xác nhận                                   | **ADOPT**            | file agent, không phải standard                                    |
| `automation_rules` §1, §7 · `playwright_rules` §3                                           | ❌ **DROP**          | trùng nguyên vẹn `TESTING-STANDARD` §1/§2/§6 + locator guideline   |
| `automation_rules` §8 `createLocatorGetter`                                                 | ❌ **DROP**          | helper không tồn tại trong repo này                                |
| `TC-XXXX` / Xray ID trong tên test                                                          | ❌ **DROP**          | repo chưa dùng Jira/Xray — ép vào sẽ đẻ ID giả                     |
| REST Assured (Java)                                                                         | ❌ **DROP**          | repo là TS/Playwright thuần                                        |

### B. `skills/` → **ADOPT** (năng lực mới, cần thích ứng đường dẫn)

| Skill                         | Giá trị                                         | Cần sửa                                             |
| ----------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| `test-data-generator` (245)   | ⭐ Rất cao — repo chưa có gì về data            | Bỏ phần combinatorial nếu quá nặng cho người mới    |
| `ui-debug-agent` (213)        | ⭐ Rất cao — soi DOM, debug locator             | Phụ thuộc quyết định R4 (MCP)                       |
| `smart-locator-agent` (78)    | Cao — sinh locator + fallback                   | Đổi con trỏ `rules/` → `LOCATOR-STRATEGY-GUIDELINE` |
| `generate-test-case` (171)    | ⭐ Cao — viết test case thủ công từ requirement | Xray CSV export → để tuỳ chọn                       |
| `references/PROMPT_TEMPLATES` | Vừa                                             | Bỏ mẫu REST Assured                                 |
| `references/PROJECT_CONTEXT`  | Vừa                                             | Điền lại cho repo này (đang là template rỗng)       |
| `references/TEST_STRATEGY`    | Vừa                                             | Bỏ Allure/REST Assured/pnpm                         |

### C. **RECONCILE** — trùng vai với cái đang có

| Nguồn                    | Trùng với          | Ghi chú                                                                                                                                                  |
| ------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `review-and-refactor`    | `test-reviewer`    | **Có thể bổ sung nhau**: ta soi _vi phạm luật trước PR_; nó dọn _sau khi test pass_ (xoá debug log, refactor). Cân nhắc giữ cả hai với vai trò tách bạch |
| `qa-automation-engineer` | cả bộ agent của ta | Là "router" tổng. Dễ gây rối cho người mới — cân nhắc bỏ, hoặc thu hẹp thành trang mục lục                                                               |

### D. **Viên ngọc** — `commands/generate-automation-from-testcases.md` (426)

Quy trình 7 bước: đọc test case → recon DOM → thiết kế POM → sinh data → sinh script → chạy & **auto-heal (tối đa 5 vòng)** → dọn & bàn giao. Đây là năng lực repo **hoàn toàn chưa có**.

Cần sửa: `src/` → `lib/` · `rtk playwright` → `npx playwright` · bỏ `createLocatorGetter` · Jira MCP thành tuỳ chọn · con trỏ `rules/` → 3 file luật của ta.

---

## Câu hỏi cần chốt ở Bước 2

| #      | Vấn đề                                                                      | Lựa chọn                                          |
| ------ | --------------------------------------------------------------------------- | ------------------------------------------------- |
| **Q1** | **Gom spec theo PAGE (nguồn) hay theo LOẠI (ta: `regression/`, `smoke/`)?** | Có thể kết hợp: thư mục theo loại, file theo page |
| **Q2** | Bật Playwright MCP không? `--headed` hay headless?                          | `ui-debug-agent` phụ thuộc cái này                |
| **Q3** | `review-and-refactor` — giữ song song `test-reviewer`, hay gộp?             |                                                   |
| **Q4** | `qa-automation-engineer` — giữ, thu hẹp, hay bỏ?                            |                                                   |
| **Q5** | Có đưa quy ước Test ID (`TC-XXXX`) vào không?                               | Repo chưa có Jira/Xray                            |
