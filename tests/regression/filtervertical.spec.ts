import { test, expect } from "@playwright/test";
import { ROUTES } from "../../lib/data/urls";
/* - Kịch bản: Tại trang vertical-layout, filter hiển thị đúng bố cục dọc
Cho trước (Given): người dùng truy cập trang https://boost-pfs-demo.myshopify.com/collections/vertical-layout
Khi (When): trang tải và Boost render xong bố cục
Thì (Then): bố cục của filter phải là DỌC (vertical)
Yêu cầu bắt buộc: 
Dùng cả 3 cách lấy selectors đã học (XPath, CSS, Playwright) tham khảo file [locator-strategy-guideline.md] - Có nghĩa là 3 test case cùng 1 mục đích test nhưng khác nhau về cách lấy selectors.*/

test ('1. Verify vertical layout is rendered when accessing URL via xpath selector', async ({page}) => {
    await page.goto (
              ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT
        )
    await expect(
        page.locator("//div[normalize-space(@class)='boost-sd__filter-tree-vertical']"))
        .toBeVisible();
    }
);

test ('2. Verify vertical layout is rendered when accessing URL via CSS selector', async ({page}) => {
    await page.goto (
        ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT
    )
    await expect(
        page.locator('.boost-sd-layout.boost-sd-layout--has-filter-vertical.boost-sd-layout--has-vertical-style-default'))
        .toBeVisible();
    }
)

test ('3. Verify vertical layout is rendered when accessing URL via playwright selector', async ({page}) => {
    await page.goto (
        ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT
    )
    await expect(
        page.locator('.'))
        .toBeVisible();
    }
);

    
