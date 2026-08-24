# Lộ trình — Đưa team QA vào Automation bằng AI

_Tài liệu theo dõi tiến độ. Cập nhật lần cuối: **2026-08-02**._

## Bối cảnh & mục tiêu

Team 12 QA manual, chưa có nền programming, chỉ có **2–3 giờ/tuần** để training. Cách
làm cũ (lý thuyết + bài tập cơ bản) quá chậm. Hướng mới: dùng **chính codebase
best-practice này** làm sân tập, và **AI làm đòn bẩy** để rút ngắn đường vào nghề.

Repo này là **sân tập → sau đó fan-out** sang các domain/project khác.

### Nguyên tắc định hướng (quan trọng nhất)

> **Mục tiêu không phải "team tạo được test bằng AI", mà là "team đủ trình PHÁN ĐOÁN một
> test đúng/sai".**

Nếu chỉ dạy cách bấm nút cho AI sinh code, ta tạo ra "prompt operator" — nguy hiểm cho
một suite E2E làm safety net, vì **một test xanh nhưng sai còn tệ hơn không có test**
(nó tạo cảm giác an toàn giả). Vì vậy kỹ năng đích là **đọc và bắt lỗi**.

### Thang tự chủ AI (lộ trình năng lực của học viên)

| Bậc | Vai của AI | Vai học viên | Kỹ năng rèn                          |
| --- | ---------- | ------------ | ------------------------------------ |
| 0   | Explainer  | Đọc & hỏi    | Hiểu POM, fixture, cấu trúc          |
| 1   | Codegen    | Ghi thao tác | `codegen` → refactor vào Page Object |
| 2   | Reviewer   | Tự viết      | Viết test, AI soi theo luật          |
| 3   | Author     | **Reviewer** | **AI viết, người bắt lỗi ← đích**    |
| 4   | Orchestr.  | Điều phối    | Chạy agent cho task thật             |

### Thước đo 90 ngày

1. Mỗi bạn tự ship được test (đã qua review)
2. Review được test do AI/đồng đội tạo ← _năng lực cốt lõi_
3. Team tự vận hành CI + thêm test cho feature mới

---

## Phase 0 — Lành hoá "golden reference" ✅ **HOÀN TẤT**

_Repo mẫu phải sạch và đáng tin trước khi đem dạy/nhân bản — reference gãy thì mọi bản
fork kế thừa cái gãy._

- [x] Sửa bug `BLACK` không định nghĩa trong `filter.data.ts`
- [x] Gỡ file smoke spec rỗng
- [x] **Fix test đỏ**: selector `.boost-sd__product` khớp 0 phần tử → `.boost-sd__product-item` (28)
- [x] README: 905 → ~215 dòng, áp _single source of truth_
- [x] Thêm [`learn-playwright.md`](learn-playwright.md) — tài liệu học tiếng Việt
- [x] 7 file config: `.env.example`, `.nvmrc`, `.prettierrc.json`, `.editorconfig`, `.gitignore`, `.gitattributes`, `.prettierignore`
- [x] Dựng CI `.github/workflows/ci.yml`
- [x] Scan & vá: untrack file generated, CI chạy cho branch `pw-practice-**`, đổi tên package, fix anchor
- [x] Bỏ secret `BASE_URL` (URL công khai, cố định → **zero setup**)
- [x] **CI xanh trên GitHub**
- [x] **Thu hẹp CI về đúng quality gate** (typecheck/lint/format) — E2E đánh vào store
      bên thứ ba dùng chung nên **chạy local trước khi push**, không chạy mỗi push

**Commit:** `5f84706`, `932cd70`, `318c79e` · đã merge + push vào `main`

---

## Phase 1 — Biến repo thành "cỗ máy dạy" 🔄 **GẦN XONG**

_Tooling để AI hỗ trợ đúng cách, và để rèn kỹ năng phán đoán._

- [x] **`TESTING-STANDARD.md`** — engine E2E phổ quát, portable, không dính domain
- [x] Refactor `CLAUDE.md` trỏ về standard (tách _engine_ khỏi _content_)
- [x] Bộ 3 agent tự viết (portable, đọc standard + `CLAUDE.md` địa phương):
  - `test-author` · `test-reviewer` · `test-healer`
  - lệnh: `/new-test` · `/review-test` · `/heal-tests`
- [x] [`ai-agents.md`](ai-agents.md) — hướng dẫn team dùng agent theo bậc
- [x] Enforce no-sleep: pin `playwright/no-wait-for-timeout` → `error` cho **cả** `tests/` và `lib/`
- [x] Đổi tên + bổ sung `LOCATOR-STRATEGY-GUIDELINE.md` (test-id linh hoạt)
- [x] **Dogfood `test-reviewer`** — bắt 9/9 vi phạm, không báo nhầm trên spec sạch
- [ ] **Dogfood `test-author`** — nhờ viết test mới → lấy reviewer soi lại (mutual validation)
- [ ] **Dogfood `test-healer`** — cố tình làm hỏng selector → xem có fix đúng gốc không

**Commit:** `adc2f06` · đã ở trên `main`

---

## Phase 2 — CI làm cảnh sát ⬜ **CHƯA BẮT ĐẦU**

_CI thay lead đi tuần tra 12 branch, thay vì soi tay từng PR._

- [x] CI quality gate (typecheck/lint/format) — _làm sớm ở Phase 0_
- [ ] Quyết định khi nào/cách nào đưa E2E vào CI (theo lịch? chỉ PR? tách smoke vs regression?)
- [ ] Guard tự động: chặn `.js` spec (repo TS-only)
- [ ] Guard: chặn commit `.env`
- [ ] Guard: chặn `page.locator(...)` viết trong `tests/`
- [ ] Guard: ép convention thư mục (`tests/Practice/` vs `tests/practice/` từng phân kỳ)
- [ ] Branch protection cho `main`

---

## Phase 3 — Sản xuất có kiểm soát ⬜ **CHƯA BẮT ĐẦU**

_Học viên thật sự làm bài dưới hệ thống mới._

- [ ] Mỗi bạn: `/new-test` ra nháp → **tự review** theo `CLAUDE.md` → mở PR
- [ ] PR bắt buộc chạy `/review-test` trước khi xin duyệt
- [ ] **Audit bài học viên → report card từng người** _(chỉ làm được khi đã có bài thật
      dưới platform mới — các branch `pw-practice-*` hiện tại là thử nghiệm cũ, trước
      khi có platform, nên không dùng để audit)_
- [ ] Đối chiếu với 3 thước đo 90 ngày

---

## Xuyên suốt — Fan-out ⬜ **NỀN MÓNG ĐÃ CÓ**

_Nhân bản sang domain/project khác._

- [x] Tách **engine** (`TESTING-STANDARD.md` + `.claude/`) khỏi **content** (`CLAUDE.md`)
- [x] Agent viết domain-agnostic ngay từ đầu
- [ ] Bộ survey → sinh/điều chỉnh `CLAUDE.md` + `lib/data` cho domain mới
- [ ] Thử fan-out thật sang 1 project khác

**Cách nhân bản hôm nay:** copy `.claude/` + `TESTING-STANDARD.md` sang project mới, rồi
viết `CLAUDE.md` riêng cho domain đó. **Giữ nguyên kiến trúc layering** — kiến trúc là
hằng số, data và luật là biến số.

---

## 🔖 Nợ kỹ thuật & quyết định hoãn

_Những thứ **cố ý gác lại**, không phải bỏ sót. Đây là nơi lưu duy nhất — các tài liệu
tạm (như [`INTEGRATION-PLAN.md`](INTEGRATION-PLAN.md)) chỉ trỏ về đây._

### N1 — Có nên xây `BasePage` không? _(hoãn 2026-08-02)_

Bộ `.claude` tích hợp vào có luật bắt locator viết dạng `(page: Page) => page.locator(...)`
để dùng với `createLocatorGetter`. Ta **không mang sang**: đó là method `protected` của
`BasePage` trong repo nguồn (`src/core/BasePage.ts`), mà repo này dùng class phẳng, không
có `BasePage` nào.

**Không phải vì pattern dở** — nó cho `this.page` dùng chung, helper `locator()`, và
autocomplete type-safe trên locator map.

- **Vì sao hoãn:** repo mới có **1 Page Object** → thêm abstraction lúc này là YAGNI, và
  làm người mới khó đọc hơn.
- **Khi nào xét lại:** khi lên ~5 Page Object và bắt đầu thấy lặp code giữa chúng.
- **Nếu làm:** nhớ cập nhật `CLAUDE.md` (bảng layering) + `docs/learn-playwright.md`.
- [ ] Xét lại khi đủ số Page Object

### N2 — Skill trùng vai chưa phân định _(hoãn 2026-08-02)_

`review-and-refactor` ↔ `test-reviewer`, và `qa-automation-engineer` ↔ cả bộ agent hiện
có. Đã quyết **giữ cả hai** để dùng thử, nhưng **chưa phân định ranh giới** → học viên có
thể không biết dùng cái nào.

- [ ] Dùng thử 1–2 tuần
- [ ] Chốt: mỗi vai trò một công cụ, **hoặc** ghi rõ trong `ai-agents.md` khi nào dùng cái nào

---

## Quyết định & bài học đã chốt

1. **Tự viết agent, không mượn generic.** Bộ agent Playwright MCP phổ biến tối ưu cho
   "duyệt UI + ghi click" và **mù luật** của project — sinh `page.click()` thẳng trong
   spec, vi phạm layering.
2. **Đừng hàn tooling vào một sample.** Từng suýt nâng thủ thuật "lọc bằng URL" (chỉ là
   cách né UI flaky của _riêng_ store demo này) thành triết lý, khiến agent cấm click UI
   → tự bó hẹp platform. **Phạm vi mở hết** (click/form/API/visual/mọi domain); kỷ luật
   nằm ở **cách viết**, không ở loại test.
3. **Luật phải có cơ chế enforce.** Prose không đủ — ví dụ no-sleep chỉ thật sự chặt khi
   pin thành lint `error` + cửa thoát bắt buộc `eslint-disable` có lý do (greppable).
4. **Negative-path là khuyến nghị, không bắt buộc** — không phải lúc nào cũng tối ưu.
5. **AI bắt lỗi giỏi, nhưng fix của nó cần người duyệt.** Quan sát thật khi dogfood:
   `test-reviewer` bắt đúng lỗi "thiếu message", nhưng fix nó đề xuất lại phá luật khác
   (bỏ web-first auto-retry). Đây chính là lý do Bậc 3 tồn tại.

---

## Việc kế tiếp

1. Dogfood `test-author` (+ mutual validation bằng `test-reviewer`)
2. Dogfood `test-healer`
3. Sang Phase 2 hoặc bắt đầu chạy thử với 1–2 thành viên
