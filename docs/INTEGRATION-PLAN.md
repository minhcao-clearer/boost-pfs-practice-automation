# Kế hoạch tích hợp bộ `.claude` mới

_Trạng thái: **Bước 1–3 xong**, đang ở Bước 4. Cập nhật 2026-08-02._

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

## Bước 2 — Chốt kiến trúc ✅ **XONG**

- [x] **R1** — trộn vào 3 file luật hiện có, không tạo `.claude/rules/`
- [x] **R2** — Q3/Q4: giữ cả hai, **hoãn** (xem _Nợ kỹ thuật_)
- [x] **R4** — bật Playwright MCP, `--headed`

Chi tiết ở _Nhật ký quyết định_.

---

## Bước 3 — Hợp nhất luật ✅ **XONG**

- [x] `TESTING-STANDARD.md`: §3 cấm cả sleep thủ công · §4 "không đoán locator, soi DOM
      thật" · §5 mỗi test ≥1 assertion · §6 format data traceable · §8 dọn debug/code chết
- [x] `LOCATOR-STRATEGY-GUIDELINE.md`: §5 hai điều kiện bắt buộc + danh sách cấm ·
      §6 quy trình kiểm chứng 4 bước
- [x] `CLAUDE.md`: naming · gom spec (thư mục=loại, file=page) · Test ID · viewport 1920×1080
- [x] **ESLint:** chặn `setTimeout` ở `tests/` + `lib/` → bịt lỗ sleep thủ công (đã kiểm chứng)
- [x] **Không** tạo `.claude/rules/` — vẫn đúng 3 file luật
- [x] `npm run check` xanh

---

## Bước 4 — Thêm skill KHÔNG trùng vai 🔄 **PORT XONG, CHỜ DOGFOOD**

Đã port 5/5, đổi tên cho gọn và nhất quán:

| Nguồn                                           | → Trong repo này                                     |
| ----------------------------------------------- | ---------------------------------------------------- |
| `smart-locator-agent`                           | `.claude/skills/smart-locator/`                      |
| `test-data-generator`                           | `.claude/skills/test-data/`                          |
| `ui-debug-agent`                                | `.claude/skills/inspect-ui/`                         |
| `generate-test-case`                            | `.claude/skills/write-test-cases/`                   |
| `generate-automation-from-testcases` (426 dòng) | `.claude/commands/automate-test-cases.md` (126 dòng) |

Đã xử lý khi port: `src/`→`lib/` · `rtk playwright`→`npx playwright` · bỏ
`createLocatorGetter` · bỏ bước `browser_resize` (đã ép trong `.mcp.json`) · trỏ lại mọi
tham chiếu `rules/` sang 3 file luật · thêm **feature** vào Inputs (phải liệt kê thư mục
có sẵn rồi hỏi) · gom spec theo chức năng + tag · Jira thành tuỳ chọn · bỏ nội dung trùng
với file luật (chỉ trích dẫn).

- [x] Sửa đường dẫn/kiến trúc cho khớp repo (`lib/`, `tests/`) — R3 xử lý xong
- [x] Mỗi skill/command trỏ về `TESTING-STANDARD.md` + `CLAUDE.md`
- [x] Thêm **feature** vào Inputs của `/automate-test-cases`
- [x] `npm run check` xanh sau mỗi lần thêm
- [ ] **Dogfood thật** từng cái → giữ hoặc chỉnh

> **Chuyển sang Bước 5:** việc đổi REST Assured/TestNG → `request` fixture của Playwright.
> Ba file nhắc nó (`qa-automation-engineer/SKILL.md`, `references/TEST_STRATEGY.md`,
> `references/PROMPT_TEMPLATES.md`) đều thuộc `qa-automation-engineer` — mà skill đó nằm
> trong nhóm **trùng vai**, xử lý ở Bước 5.

**Xong khi:** mỗi skill mới đã chạy thật ít nhất 1 lần và cho kết quả đúng chuẩn.

---

## Bước 5 — Xử lý phần trùng vai _(commit 3)_

- [ ] Áp quyết định R2 cho `review-and-refactor`, `qa-automation-engineer`
- [ ] Nếu gộp: giữ **một** tên duy nhất cho mỗi vai trò, xoá cái còn lại
- [ ] Cập nhật [`ai-agents.md`](ai-agents.md) — bảng agent/skill phải khớp thực tế
- [ ] Đổi REST Assured/TestNG (Java) → `request` fixture của Playwright, trong
      `qa-automation-engineer/SKILL.md` + `TEST_STRATEGY.md` + `PROMPT_TEMPLATES.md` #3

**Xong khi:** mỗi vai trò (viết / soi / chữa / …) có đúng **một** công cụ.

### Đã phân tích sẵn ở Bước 4 — `qa-automation-engineer`

**Phải tách làm hai, đừng quyết cả cụm:**

**(1) `SKILL.md` (108 dòng) — là trang mục lục, không tự định nghĩa luật nào** (nó ghi
_"do not repeat here"_ rồi trỏ sang `rules/`). Đối chiếu 9 năng lực nó khai:

| Năng lực                                                                               | Repo ta                                                                                                          |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Manual test cases · automation từ test case · test data · locator · explore UI · flaky | ✅ đã có (`write-test-cases`, `/automate-test-cases`, `test-data`, `smart-locator`, `inspect-ui`, `test-healer`) |
| **API test từ Swagger/OpenAPI**                                                        | ❌ chưa có                                                                                                       |
| **Sinh automation framework**                                                          | ❌ chưa có                                                                                                       |
| **Sinh requirement từ phân tích website**                                              | ❌ chưa có                                                                                                       |

→ **6/9 đã được phủ.** `docs/ai-agents.md` cũng đang làm vai trò mục lục tốt hơn (tiếng
Việt, có bảng "dùng khi nào"). Bỏ `SKILL.md` gần như không mất gì — **trừ 3 năng lực chưa
có nhà** ở trên, cần quyết có muốn không.

**(2) `references/` (209 dòng) — KHÔNG trùng với bất cứ thứ gì trong repo:**

| File                  | Dòng | Nội dung                                                               | Ghi chú khi port                |
| --------------------- | ---- | ---------------------------------------------------------------------- | ------------------------------- |
| `PROMPT_TEMPLATES.md` | 116  | Mẫu prompt tái dùng cho các task QA                                    | Bỏ mẫu REST Assured (#3)        |
| `TEST_STRATEGY.md`    | 54   | Mục tiêu, scope, lịch chạy (smoke mỗi build, regression trước release) | Bỏ Allure / REST Assured / pnpm |
| `PROJECT_CONTEXT.md`  | 39   | Mô tả app đang test — đang điền dở cho Shopify                         | Điền lại cho repo này           |

→ Đây là **nội dung thật, chưa được phủ ở đâu**. Quyết riêng, và quyết cả **chỗ đặt**
(`docs/`? `.claude/skills/`?).

---

## Bước 6 — Chốt & tài liệu hoá _(commit 4)_

- [ ] Cập nhật `ai-agents.md` (danh sách đầy đủ + dùng khi nào)
- [ ] Cập nhật [`ROADMAP.md`](ROADMAP.md)
- [ ] `npm run check` xanh, push, CI xanh

---

## Nhật ký quyết định

_(điền dần khi chốt từng điểm — để sau này biết **vì sao** làm vậy)_

| Ngày       | Vấn đề                                                               | Quyết định                                                                                                           | Lý do                                                                                                                                                                                                                                                                              |
| ---------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-02 | **Q1** Gom spec theo page hay theo loại?                             | **Kết hợp:** thư mục theo loại (`regression/`, `smoke/`), file gom test của cùng một Page Object                     | Giữ được cả hai ưu điểm; không phá cấu trúc đang có                                                                                                                                                                                                                                |
| 2026-08-02 | **Q2** Bật Playwright MCP?                                           | **Bật, headed** — đã tạo `.mcp.json` ✅                                                                              | Học viên nhìn thấy AI soi DOM thật — giá trị dạy học cao. ⚠️ **Bộ nguồn dùng `--headed` là SAI**: flag đó không tồn tại (chỉ có `--headless`, và headed là mặc định). Đồng thời đặt luôn `--viewport-size 1920x1080` trong config thay vì trông chờ agent nhớ gọi `browser_resize` |
| 2026-08-02 | **Q3/Q4** `review-and-refactor` + `qa-automation-engineer` trùng vai | **Giữ CẢ HAI, đánh dấu để xử lý sau**                                                                                | Chưa đủ dữ kiện để chốt; cần dùng thử rồi mới quyết. ⚠️ **Việc còn treo — xem "Nợ kỹ thuật" bên dưới**                                                                                                                                                                             |
| 2026-08-02 | **Q5** Quy ước Test ID `TC-XXXX`                                     | **Có** — nhưng dạng _"khi test có ticket Jira/Xray thì đặt ID vào đầu title"_, **không bắt buộc khi chưa có ticket** | Chuẩn bị sẵn cho Jira, nhưng không đẻ ID giả — chính luật nguồn cấm "invented placeholders"                                                                                                                                                                                        |
| 2026-08-25 | **Q6** Có giữ `Step 1.3 Determine tech stack` của nguồn không?       | **Bỏ**                                                                                                               | Stack repo này đã cố định và ghi trong `CLAUDE.md` (Playwright ^1.59 + TS strict + Node 20) — không có tình huống "unclear" để chọn                                                                                                                                                |
| 2026-08-25 | **Q7** Có thêm bước bàn giao cho review (không có trong nguồn)?      | **Có** — `Step 7.5: Hand off for review` → chạy `/review-test`                                                       | Repo đã có `test-reviewer`; khớp nguyên tắc "AI soạn nháp, người phán đoán" — code AI sinh ra là bản nháp cho tới khi có người duyệt                                                                                                                                               |

### ⚠️ Nợ kỹ thuật

Hai thứ **cố ý gác lại** trong đợt tích hợp này — cả hai đã ghi vào
[`ROADMAP.md` › Nợ kỹ thuật & quyết định hoãn](ROADMAP.md#-nợ-kỹ-thuật--quyết-định-hoãn),
là **nơi lưu duy nhất** (file này chỉ là tài liệu tạm của đợt tích hợp, xong sẽ không ai
đọc nữa):

- **N1** — có nên xây `BasePage` / `createLocatorGetter` không? _(xét lại khi ~5 Page Object)_
- **N2** — `review-and-refactor` + `qa-automation-engineer` trùng vai, chưa phân định ranh giới

---

## Bảng phân loại _(kết quả Bước 1)_

### Tin tốt phát hiện khi đọc

1. **Cùng ứng dụng.** `PROJECT_CONTEXT.md` đã trỏ đúng `boost-pfs-demo.myshopify.com/collections/vertical-layout` → **R3 nhẹ hơn dự đoán**: chỉ khác layout thư mục (`src/` vs `lib/`), không khác app.
2. **Bộ mới đã tự áp single-source-of-truth.** Các skill ghi rõ _"defined in rules files — do not duplicate here"_ và trỏ về `rules/`. Nên khi ta trộn luật vào 3 file hiện có, chỉ cần **đổi con trỏ** — cơ học, ít rủi ro.
3. **Nó vá được lỗ hổng của ta.** `playwright_rules` §4 cấm cả `await new Promise(r => setTimeout(...))`. **Đã kiểm chứng: ESLint hiện tại KHÔNG bắt được dạng này** → sleep vẫn lọt. Đây là lợi ích tức thì, độc lập với việc tích hợp.

### A. `rules/` → **MERGE** vào 3 file luật (không tạo `.claude/rules/`)

| Nội dung nguồn                                                                              | Quyết định                  | Đi đâu                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `automation_rules` §2 **Test data unique/traceable** `[prefix]_[test]_[timestamp]_[random]` | ⭐ **ADOPT**                | `TESTING-STANDARD` §6 (ta mới nói "unique data", chưa có format)                                                                                                                                                                                                                      |
| `playwright_rules` §2 **Không đoán locator — soi DOM thật**                                 | ⭐ **ADOPT**                | `TESTING-STANDARD` §4 — _đúng bài học từ bug `.boost-sd__product`_                                                                                                                                                                                                                    |
| `playwright_rules` §4 cấm `new Promise(setTimeout)`                                         | ⭐ **ADOPT**                | `TESTING-STANDARD` §3 + **thêm ESLint rule**                                                                                                                                                                                                                                          |
| `locator_strategy` §3 **Quy trình verify locator (4 bước)**                                 | ⭐ **ADOPT**                | `LOCATOR-STRATEGY-GUIDELINE`                                                                                                                                                                                                                                                          |
| `locator_strategy` §2 Stability (unique-in-scope, tránh class hash)                         | **ADOPT**                   | `LOCATOR-STRATEGY-GUIDELINE`                                                                                                                                                                                                                                                          |
| `automation_rules` §6 "mỗi test ≥1 assertion"                                               | **ADOPT**                   | `TESTING-STANDARD` §5                                                                                                                                                                                                                                                                 |
| `automation_rules` §3 Xoá debug log / code chết trước khi giao                              | **ADOPT**                   | `TESTING-STANDARD` §8                                                                                                                                                                                                                                                                 |
| `automation_rules` §5 Naming (PascalCase Page, kebab-case.spec.ts)                          | **ADOPT (một phần)**        | `CLAUDE.md`                                                                                                                                                                                                                                                                           |
| `playwright_rules` §1 Viewport 1920×1080 + MCP resize                                       | **ADOPT**                   | mục MCP mới (gắn R4)                                                                                                                                                                                                                                                                  |
| `automation_rules` §4 Không tự xoá file khi chưa xác nhận                                   | **ADOPT**                   | file agent, không phải standard                                                                                                                                                                                                                                                       |
| `automation_rules` §1, §7 · `playwright_rules` §3                                           | ⏭️ **Đã có sẵn**            | Luật **vẫn giữ**, chỉ không chép lại: đã sống ở `TESTING-STANDARD` §1/§2/§6 và `LOCATOR-STRATEGY-GUIDELINE` §2 — bản của ta còn chi tiết hơn. Chép lần nữa = nguồn thứ hai = R1                                                                                                       |
| `automation_rules` §8 `createLocatorGetter`                                                 | ❌ **DROP**                 | Neo vào kiến trúc repo nguồn: là method `protected` trong `src/core/BasePage.ts`, mọi page bên đó **kế thừa** `BasePage`. Repo này dùng class phẳng, **không có `BasePage`** → luật sẽ trỏ tới thứ không tồn tại. _Không phải pattern dở — muốn dùng phải quyết định kiến trúc riêng_ |
| `TC-XXXX` / Xray ID trong tên test                                                          | ✅ **ADOPT (có điều kiện)** | Q5: đặt ID khi có ticket thật; chưa có ticket thì title mô tả là đủ — **đã vào `CLAUDE.md`**                                                                                                                                                                                          |
| REST Assured / TestNG                                                                       | ❌ **DROP**                 | Thư viện **Java**, repo này TypeScript thuần → agent sẽ sinh code Java. _API testing vẫn đáng có, nhưng qua `request` fixture của Playwright_                                                                                                                                         |

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
