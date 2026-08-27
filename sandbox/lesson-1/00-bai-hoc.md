# Bài 1 — Commit

Nhánh: `sandbox/lesson-1-commit` · Thời lượng: ~35 phút · Công cụ: SourceTree

---

## A. Commit là gì

Một commit là **ảnh chụp toàn bộ project tại một thời điểm**, kèm theo ba thông tin: ai chụp, chụp lúc nào, và vì sao chụp (message).

Ba điều cần nói rõ ngay từ đầu:

**Commit không phải "Save".** Save (Cmd+S) ghi nội dung mới lên file, đè lên nội dung cũ — cái cũ mất luôn. Commit thì tạo một **mốc** mà bạn có thể quay về bất cứ lúc nào. Save là ghi; commit là ghi nhớ.

**Commit là bất biến.** Mỗi commit có một ID riêng (hash, ví dụ `dbfa36c`). Đã tạo rồi thì không sửa được. Cái mà SourceTree gọi là "Amend" thực chất là **tạo một commit mới rồi bỏ commit cũ đi** — nên hash thay đổi. Đây là lý do của quy tắc ở mục D.

**Commit chỉ nằm trên máy bạn.** Commit xong, đồng nghiệp vẫn chưa thấy gì. Phải push. Đây là chỗ nhầm phổ biến nhất của người mới.

### Ba vùng mà một thay đổi phải đi qua

```
    Working copy    ──►    Staged (index)    ──►    Commit
    (bạn vừa sửa)        (đã chọn để commit)      (đã ghi nhớ)

    thao tác:            Stage file              Commit
    hủy bằng:            Discard file            Reset
```

Câu hỏi để tự kiểm tra suốt buổi: **"thay đổi của tôi đang ở ô nào?"**

---

## B. Tại sao cần commit

### 1. Tạo điểm quay về

> Bạn viết một test mới. Chạy — pass. Bạn nghĩ "để dọn lại cho gọn", sửa thêm 30 phút. Chạy lại — fail. Và bạn không biết mình đã phá cái gì.

Nếu lúc test pass bạn đã commit: một cú Discard là về lại chỗ chạy được.
Nếu chưa: mò lại từng dòng.

Đây là lý do quan trọng nhất, và là lý do người ta commit **nhiều lần trong một buổi làm việc** thay vì một lần cuối ngày.

### 2. Chia việc thành đơn vị người khác đọc được

Một commit "sửa 12 file, đủ thứ chuyện" thì không ai review được. Ba commit nhỏ, mỗi cái một ý, thì đọc được — và khi có bug, tìm ra thủ phạm nhanh hơn nhiều.

### 3. Chưa commit thì không push được

Chưa push thì: đồng nghiệp không thấy, không ai review được, và máy hỏng là mất trắng. Commit là bước bắt buộc trên đường đưa việc của bạn ra khỏi máy mình.

### 4. Truy nguyên

Mở History trong SourceTree, chọn một dòng code, bạn biết được: ai viết, lúc nào, và commit message nói vì sao. Một commit message tốt hôm nay tiết kiệm nửa buổi điều tra sáu tháng sau.

---

## C. Chín tình huống liên quan tới commit

| # | Bối cảnh | Làm gì trong SourceTree |
| --- | --- | --- |
| 1 | Vừa tạo file mới, Git chưa biết đến nó | **Stage file** |
| 2 | File đã có, bạn sửa nội dung | Xem diff → **Stage file** |
| 3 | Sửa nhiều việc không liên quan cùng lúc | Stage từng phần → **nhiều commit riêng** |
| 4 | Hai việc không liên quan **trong cùng một file** | **Stage Selected Lines / Stage Hunk** |
| 5 | Thay đổi thử nghiệm, không muốn giữ | **Discard file** |
| 6 | Muốn file không còn tồn tại trong project | **Remove file** |
| 7 | File rác không nên vào Git | **Ignore file** |
| 8 | Commit rồi mới thấy sai message hoặc thiếu file | **Amend latest commit** |
| 9 | Chưa xong nhưng phải đi làm việc khác | **Stash** → sang bài 2 |

### 1. File mới — untracked

Git chia file làm hai loại: **tracked** (Git đang theo dõi) và **untracked** (Git thấy nhưng chưa quản lý). File mới tạo luôn là untracked.

Trong SourceTree nó hiện ở khung *Unstaged files* với dấu `?`. Bấm **Stage file** là bạn nói với Git: "từ giờ theo dõi file này, và đưa nó vào commit tới".

> **Quan trọng cho bài 2:** file untracked mặc định **không được stash**. Đây là lý do.

### 2. File đã tracked bị sửa

Luôn **xem diff trước khi stage**. Khung bên phải của SourceTree hiện dòng xanh (thêm) và dòng đỏ (bớt). Đây là cơ hội cuối cùng để phát hiện mình vô tình sửa gì đó không định sửa.

Thói quen cần dạy: *không bao giờ stage một file mà chưa xem diff của nó.*

### 3. Nhiều việc không liên quan → nhiều commit

Bạn sửa `config.json` để tăng timeout, và sửa `test-plan.md` để thêm một test case. Hai việc này **không liên quan gì đến nhau**.

Sai: stage cả hai, commit một lần, message "update files".
Đúng: stage `config.json` → commit → stage `test-plan.md` → commit.

Lý do thực dụng: nếu sau này việc tăng timeout hoá ra sai và cần bỏ đi, bạn bỏ được đúng nó mà không mất test case.

### 4. Hai việc trong cùng một file — Stage Hunk

Đây là tình huống mà GUI thắng dòng lệnh, và là lý do đáng dùng SourceTree.

Bạn sửa hai chỗ xa nhau trong cùng `test-plan.md`. Bôi đen phần diff của chỗ thứ nhất → **Stage Selected Lines**. Commit. Rồi làm tiếp chỗ thứ hai.

Lúc này file sẽ hiện **đồng thời ở cả khung trên và khung dưới** — vì Git đang giữ hai phiên bản: bản đã stage và bản trên đĩa. Đây là thứ làm mọi người hoang mang nhất; nói trước để họ không sợ.

### 5. Discard file

Trả file về đúng như commit gần nhất. **Không hoàn tác được** — không có Cmd+Z, không có thùng rác. Đây là nút nguy hiểm nhất trong menu.

Dùng khi: bạn thử một hướng, thấy sai, muốn bỏ hẳn.

### 6. Remove file — khác Discard

Đây là cặp dễ nhầm nhất, phải demo cả hai cạnh nhau:

- **Discard** bỏ *thay đổi* → **file vẫn còn**.
- **Remove** xoá *file* khỏi project → và đó là một thay đổi, vẫn **phải commit**.

Người mới hay bấm Remove khi chỉ muốn hoàn tác.

### 7. Ignore file — và vì sao nó thường bị xám

**Ignore file** thêm file vào `.gitignore` để Git thôi để ý tới nó. Dùng cho file rác local: `.env`, screenshot, `playwright-report/`, `test-results/`.

Nếu bạn chuột phải một file mà thấy **Ignore file bị xám**, nguyên nhân là: **file đó đã được Git theo dõi rồi**. Ignore chỉ có tác dụng với file untracked. Muốn thôi theo dõi một file đã tracked thì phải gỡ nó ra khỏi Git trước — một việc khác hẳn.

Chi tiết này đáng chỉ ra vì nó dạy đúng khái niệm tracked / untracked ở tình huống 1.

### 8. Amend — sửa commit vừa tạo

Commit xong mới thấy message sai chính tả, hoặc quên mất một file. Tick **Amend latest commit** rồi commit lại.

Nhớ: amend **đổi hash**. Xem quy tắc ở mục D.

### 9. Chưa xong nhưng phải làm việc khác

Không commit được (việc đang dở), không discard được (mất công). Đây là lúc cần **Stash** — nội dung bài 2.

Câu phân biệt cần ghi lại:

> **Commit là "xong một mẩu, ghi lại". Stash là "chưa xong, cất tạm".**

---

## D. Ba quy tắc

**1. Một commit = một ý.** Đọc message mà phải dùng chữ "và" thì thường là nên tách thành hai commit.

**2. Message: dòng đầu dưới 72 ký tự, thể mệnh lệnh, có tiền tố loại.**

```
feat: thêm test case cho filter theo màu
fix: tăng timeout lên 60s cho mạng chậm
docs: cập nhật quy ước selector
chore: bỏ file cấu hình không dùng
```

Không viết: `update`, `fix bug`, `asdfgh`, `commit lần 3`.

**3. Chỉ amend commit CHƯA push.** Amend đổi hash. Nếu commit đó đã lên remote, lần push sau sẽ bị từ chối, và cách duy nhất để đi tiếp là force push — đè lên nhánh của người khác.

---

## E. Bài tập trên nhánh này

Ba file để tập: `test-plan.md`, `config.json`, `notes.md`. Tick vào từng ô khi làm xong.

- [ ] **1.** Tạo file mới `sandbox/lesson-1/cua-toi.md`, viết tên bạn vào, commit — *tình huống 1*
- [ ] **2.** Trong `config.json` đổi `timeout` thành `60`. **Xem diff trước** rồi commit — *tình huống 2*
- [ ] **3.** Sửa `config.json` (đổi `retries`) **và** `notes.md` (thêm một dòng) cùng lúc, rồi tách thành **2 commit riêng** — *tình huống 3*
- [ ] **4.** Trong `test-plan.md` sửa **mục 2 và mục 11**, dùng Stage Selected Lines để tách thành **2 commit** — *tình huống 4*
- [ ] **5.** Sửa bừa `notes.md` rồi **Discard** — *tình huống 5*
- [ ] **6.** **Remove** `notes.md`, xem status thay đổi thế nào, rồi Discard để lấy lại — *tình huống 6*
- [ ] **7.** Tạo file `scratch.log`, chuột phải xem **Ignore file** có bật không. So sánh với khi chuột phải `config.json` — *tình huống 7*
- [ ] **8.** Commit với message sai chính tả, rồi **Amend** để sửa — *tình huống 8*

Xong hết thì reset về điểm xuất phát: History → chuột phải commit có nhãn `origin/sandbox/lesson-1-commit` → **Reset current branch to this commit** → **Hard**.
