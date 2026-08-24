# Học Playwright — Hướng dẫn cho người mới

_Dành cho thành viên mới của team, đặc biệt là các bạn chuyển từ **manual QA** sang
**automation**._

Tài liệu này giải thích **các khái niệm nền** của Playwright và **đi từng dòng** qua
test thật của dự án, để bạn hiểu _vì sao_ code được viết như vậy — không chỉ _làm sao_
để chạy.

> Ba tài liệu, ba vai trò — đọc đúng chỗ khi cần:
>
> | Bạn muốn…                   | Đọc                                                                 |
> | --------------------------- | ------------------------------------------------------------------- |
> | Hiểu Playwright (file này)  | Tiếp tục đọc bên dưới                                               |
> | Biết **luật** khi viết test | [`CLAUDE.md`](../CLAUDE.md)                                         |
> | Chọn **locator** cho đúng   | [`locator-strategy-guideline.md`](../locator-strategy-guideline.md) |
> | Cách **chạy** dự án         | [`README.md`](../README.md)                                         |

---

## Mục lục

1. [Playwright 101 — những viên gạch đầu tiên](#1-playwright-101--những-viên-gạch-đầu-tiên)
2. [Quyết định thiết kế quan trọng nhất: lọc bằng URL, không click UI](#2-quyết-định-thiết-kế-quan-trọng-nhất-lọc-bằng-url-không-click-ui)
3. [Đọc hiểu test hiện tại (từng dòng)](#3-đọc-hiểu-test-hiện-tại-từng-dòng)
4. [Viết một test mới](#4-viết-một-test-mới)
5. [Thuật ngữ](#5-thuật-ngữ)

---

## 1. Playwright 101 — những viên gạch đầu tiên

Đọc mục này **một lần**; phần còn lại của tài liệu giả định bạn đã nắm.

### 1.1 Test, assertion, locator

```ts
import { test, expect } from "../../lib/fixtures";

test("tên test của tôi", async ({ page }) => {
  await page.goto("/some-path"); // điều hướng
  const heading = page.locator("h1"); // locator = "con trỏ lười" tới element
  await expect(heading).toHaveText("Hello"); // assertion (tự retry)
});
```

- **`test(name, fn)`** — khai báo một test. `fn` là hàm `async`, nhận các _fixture_
  (như `page`) qua tham số `{ ... }`.
- **`async` / `await`** — thao tác trình duyệt là bất đồng bộ; bạn `await` từng dòng để
  nó chạy xong mới sang dòng sau. **Quên `await` là lỗi số 1 của người mới.**
- **`page`** — tab trình duyệt, được cấp tự động cho mọi test.
- **Locator** — một _mô tả_ về element (ví dụ `.boost-sd__product-item`). Nó **lười**:
  không có gì xảy ra cho tới khi bạn thao tác hoặc assert lên nó.
- **`expect(...)`** — assertion. Các "web-first assertion" của Playwright **tự động
  retry** cho tới khi đúng hoặc hết giờ → loại bỏ phần lớn flaky.

### 1.2 Auto-waiting — đừng bao giờ `sleep`

Playwright **tự chờ** element sẵn sàng trước khi click, và tự chờ assertion thành đúng.

> **TUYỆT ĐỐI không** dùng `page.waitForTimeout(3000)` hay bất kỳ "sleep" cố định nào.
> Nó chậm khi không cần, và flaky khi trang chậm hơn con số bạn đoán. Hãy chờ một
> **điều kiện** (một locator hiện ra, một assertion đúng). Đây cũng là **luật cứng**
> trong [`CLAUDE.md`](../CLAUDE.md).

### 1.3 Page Object Model (POM)

Thay vì rải selector CSS khắp các test, ta gom vào một class. Xem
[`lib/pages/filter.page.ts`](../lib/pages/filter.page.ts):

```ts
export class FilterPage {
  readonly filteredProducts: Locator;
  constructor(page: Page) {
    this.filteredProducts = page.locator(".boost-sd__product-item");
  }
  async getProductData(): Promise<ProductData[]> {
    /* đọc dữ liệu từ mỗi thẻ sản phẩm */
  }
}
```

**Lợi ích:** nếu Boost đổi tên class CSS đó, ta sửa **một chỗ**, mọi test vẫn chạy.
Cách _chọn_ selector nào để bỏ vào đây → xem
[`locator-strategy-guideline.md`](../locator-strategy-guideline.md).

### 1.4 Fixtures (dependency injection)

**Fixture** là object được "dọn sẵn" và đưa vào test. Ta mở rộng `test` của Playwright
để mọi test chỉ cần "xin" `filterPage`
([`lib/fixtures/index.ts`](../lib/fixtures/index.ts)):

```ts
export const test = base.extend<{ filterPage: FilterPage }>({
  filterPage: async ({ page }, use) => {
    await use(new FilterPage(page));
  },
});
```

Đó là lý do test import `{ test, expect }` từ `../../lib/fixtures` **chứ không** từ
`@playwright/test` — bản của ta đã biết `filterPage`, nên chữ ký test có thể là
`async ({ page, filterPage }) => { ... }`.

### 1.5 Dữ liệu tách khỏi test (data-driven)

Input của test sống trong [`lib/data/filter.data.ts`](../lib/data/filter.data.ts):

```ts
export const FILTER_DATA = {
  COLOR: { BLUE: "Blue" },
  PRICE: { MIN: "10", MAX: "100" },
} as const;
```

Test tham chiếu `FILTER_DATA.COLOR.BLUE` thay vì viết chuỗi "Blue" thẳng trong test.
Đổi dữ liệu ở một nơi là đổi được mục tiêu của test.

---

## 2. Quyết định thiết kế quan trọng nhất: lọc bằng URL, không click UI

Đây là điều quan trọng nhất cần hiểu về dự án này.

Storefront demo của Boost render bộ lọc theo **hai layout khác nhau** (thanh dọc các ô
màu, hoặc dropdown ngang thu gọn), và store demo dùng chung **đổi qua lại không lường
trước được**. Vì vậy click vào một ô màu hôm nay chạy, mai lại treo (control đang nằm
trong dropdown đóng).

Boost cũng nhận bộ lọc qua **tham số URL** và áp dụng ngay khi tải trang. Nên thay vì
click, ta điều hướng thẳng tới URL đã lọc sẵn:

```
/collections/vertical-layout?color=Blue&price=10:100
```

Cách này **không phụ thuộc layout và ổn định** — nó không quan tâm UI bộ lọc nào đang
hiện. URL đó được dựng bởi
[`buildFilteredCollectionUrl`](../lib/data/urls.ts). Đây là kỹ thuật chuẩn để giữ test
E2E ổn định trước một UI của bên thứ ba mà bạn không kiểm soát.

---

## 3. Đọc hiểu test hiện tại (từng dòng)

File: [`tests/regression/filter.spec.ts`](../tests/regression/filter.spec.ts).

```ts
import { test, expect } from "../../lib/fixtures"; // test + expect đã mở rộng của ta
import { ROUTES, buildFilteredCollectionUrl } from "../../lib/data/urls";
import { FILTER_DATA } from "../../lib/data/filter.data";

// Một sản phẩm ĐẠT bộ lọc giá khi khoảng giá của nó GIAO NHAU với dải lọc — Boost hiện
// sản phẩm nếu BẤT KỲ biến thể nào nằm trong dải, không cần cả khoảng nằm gọn bên trong.
const priceRangeOverlaps = (
  productMin: number,
  productMax: number,
  bandMin: number,
  bandMax: number,
) => productMin <= bandMax && productMax >= bandMin;

test("Filter validation: a colour + price filtered collection shows only matching products", async ({
  page,
  filterPage,
}) => {
  const minPrice = Number(FILTER_DATA.PRICE.MIN);
  const maxPrice = Number(FILTER_DATA.PRICE.MAX);

  // 1. Điều hướng tới URL đã mang sẵn bộ lọc màu + giá.
  await page.goto(
    buildFilteredCollectionUrl(
      ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT,
      FILTER_DATA.COLOR.BLUE,
      FILTER_DATA.PRICE.MIN,
      FILTER_DATA.PRICE.MAX,
    ),
    { waitUntil: "domcontentloaded" },
  );

  // 2. Boost render lưới sản phẩm bất đồng bộ — chờ thẻ đầu tiên xuất hiện.
  await filterPage.waitForProductsLoaded();

  // 3. Bộ lọc phải trả về ít nhất một sản phẩm (web-first assertion, tự retry).
  await expect(filterPage.filteredProducts).not.toHaveCount(0);

  // 4. Đọc mọi thẻ sản phẩm thành dữ liệu có kiểu.
  const productData = await filterPage.getProductData();

  // 5. Mọi sản phẩm hiện ra phải khớp CẢ màu LẪN giá.
  for (const { handle, colors, priceMin, priceMax } of productData) {
    const matchesColor =
      colors.some((color) => color.includes(FILTER_DATA.COLOR.BLUE)) ||
      colors.includes("Multi Color");
    expect(
      matchesColor,
      `Product "${handle}" offers no ${FILTER_DATA.COLOR.BLUE} colour (has: ${colors.join(", ")})`,
    ).toBeTruthy();

    const overlapsPriceBand = priceRangeOverlaps(
      priceMin,
      priceMax,
      minPrice,
      maxPrice,
    );
    expect(
      overlapsPriceBand,
      `Product "${handle}" price range [${priceMin}, ${priceMax}] does not overlap [${minPrice}, ${maxPrice}]`,
    ).toBeTruthy();
  }
});
```

**Hai chỗ tinh tế phải hiểu** (và **không được** siết chặt lại — sẽ gây false failure;
xem [`CLAUDE.md`](../CLAUDE.md)):

- **Khớp màu cố ý "lỏng".** Boost coi `Teal Blue` / `Baby Blue` là khớp "Blue", và
  `Multi Color` khớp mọi màu — nên ta dùng `includes(...)` cộng với ngoại lệ
  `Multi Color`. Nếu đổi sang so khớp bằng `===` thì các sản phẩm đó sẽ bị **trượt oan**.
- **Giá dùng "giao nhau" (overlap), không phải "chứa trọn".** Một sản phẩm có thể có
  biến thể Xanh giá \$50 và biến thể Đỏ giá \$150. Boost hiển thị nó dưới bộ lọc 10–100
  (cái Xanh đạt), và khoảng giá cấp-sản-phẩm là `[50, 150]`. Nếu đòi cả khoảng nằm gọn
  trong `[10, 100]` thì sẽ **trượt oan** — nên ta assert **overlap**.

Vì mỗi assertion đều có **message**, khi fail nó nói rõ đúng sản phẩm và giá trị sai,
ví dụ: `Product "x" offers no Blue colour (has: Black, Red)`. Message chính là **dòng
đầu tiên khi debug**.

---

## 4. Viết một test mới

Pattern luôn cố định: **data → URL → điều hướng → chờ → đọc → assert.** Ví dụ: thêm test
lọc theo màu Đen.

**Bước 1 — thêm dữ liệu** vào
[`lib/data/filter.data.ts`](../lib/data/filter.data.ts):

```ts
export const FILTER_DATA = {
  COLOR: { BLUE: "Blue", BLACK: "Black" }, // <- thêm Black
  PRICE: { MIN: "10", MAX: "100" },
} as const;
```

**Bước 2 — viết test.** Nếu tạo file mới (ví dụ
`tests/regression/filter-black.spec.ts`), bắt đầu bằng đúng các import này — đây là file
chạy được hoàn chỉnh:

```ts
import { test, expect } from "../../lib/fixtures";
import { ROUTES, buildFilteredCollectionUrl } from "../../lib/data/urls";
import { FILTER_DATA } from "../../lib/data/filter.data";

test("Filter validation: Black-filtered collection shows only black products", async ({
  page,
  filterPage,
}) => {
  await page.goto(
    buildFilteredCollectionUrl(
      ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT,
      FILTER_DATA.COLOR.BLACK,
      FILTER_DATA.PRICE.MIN,
      FILTER_DATA.PRICE.MAX,
    ),
    { waitUntil: "domcontentloaded" },
  );
  await filterPage.waitForProductsLoaded();

  const products = await filterPage.getProductData();
  for (const { handle, colors } of products) {
    const matches =
      colors.some((c) => c.includes(FILTER_DATA.COLOR.BLACK)) ||
      colors.includes("Multi Color");
    expect(matches, `Product "${handle}" is not black`).toBeTruthy();
  }
});
```

**Bước 3 — cần selector/hành động mới?** Thêm method vào **Page Object**, không phải vào
test. Ví dụ đọc tên mỗi sản phẩm:

```ts
// trong lib/pages/filter.page.ts, bên trong class FilterPage
async getProductTitles(): Promise<string[]> {
  return this.filteredProducts.evaluateAll((cards) =>
    cards.map((c) => c.querySelector(".boost-sd__product-title")?.textContent ?? ""),
  );
}
```

**Bước 4 — đừng quên negative-path.** Theo [`CLAUDE.md`](../CLAUDE.md), mỗi happy-path
cần **một test negative-path** cho mỗi kiểu lỗi hợp lý (ví dụ một bộ lọc _phải_ trả về 0
sản phẩm). Đây là điều người mới hay bỏ sót nhất.

**Bước 5 — chạy** bằng `npm run test:ui` khi phát triển (phản hồi nhanh), rồi `npm test`
trước khi push, và cuối cùng là ba cổng chất lượng:

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
```

**Vài luật vàng khi thêm test** (bản đầy đủ trong [`CLAUDE.md`](../CLAUDE.md)):

- File `*.spec.ts` đặt dưới `tests/` (Playwright chỉ nhận đuôi `.spec.ts`).
- Không selector CSS trong file test — để trong Page Object.
- Không chuỗi/URL cứng — để trong `lib/data`.
- Không `waitForTimeout` — chờ điều kiện.
- Mỗi `test(...)` một hành vi; title mô tả rõ (nó hiện trong report).

---

## 5. Thuật ngữ

### Playwright / testing

| Thuật ngữ             | Nghĩa                                                            |
| --------------------- | ---------------------------------------------------------------- |
| **E2E**               | End-to-end: lái trình duyệt thật như người dùng                  |
| **Locator**           | Tham chiếu lười, tự-chờ, tới element trên trang                  |
| **Assertion**         | `expect(...)`; một kiểm tra (web-first thì tự retry)             |
| **Page Object (POM)** | Class chứa locator + hành động của một trang                     |
| **Fixture**           | Object Playwright bơm vào test (ví dụ `page`, `filterPage`)      |
| **Trace**             | Bản ghi một lần chạy test, xem lại được từng bước                |
| **Flaky**             | Test lúc đậu lúc rớt dù code không đổi                           |
| **Headless / headed** | Trình duyệt chạy ẩn / có cửa sổ hiện ra                          |
| **Worker**            | Tiến trình song song Playwright dùng để chạy nhiều test cùng lúc |

### Shopify / Boost

| Thuật ngữ          | Nghĩa                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| **Storefront**     | Website mua sắm công khai mà khách xem                                   |
| **Collection**     | Một nhóm/danh sách sản phẩm (ví dụ "vertical-layout"); thứ ta đem đi lọc |
| **Product**        | Một mặt hàng; có thể có nhiều biến thể                                   |
| **Variant**        | Một phiên bản cụ thể của sản phẩm (ví dụ _Blue / M_), có giá/tồn riêng   |
| **Handle**         | Slug URL của sản phẩm, ví dụ `blue-mesh-mix-dress`                       |
| **Swatch**         | Ô màu nhỏ trong UI bộ lọc                                                |
| **`data-product`** | Thuộc tính HTML trên mỗi thẻ sản phẩm Boost, chứa dữ liệu JSON của nó    |
| **Facet / filter** | Một tiêu chí để khách lọc (màu, giá, size…)                              |

---

_Thấy thuật ngữ nào chưa rõ? Hỏi lead hoặc người review PR — ai cũng bắt đầu từ manual
cả._
