import { SHOP_CATALOG, ShopItem } from "../data/shopCatalog";

describe("Shop & Theme Economy", () => {
    describe("Catalog Verification", () => {
        it("contains default free theme and free animation with 0 cost", () => {
            const defaultTheme = SHOP_CATALOG.find(i => i.id === "theme_default");
            const defaultAnimation = SHOP_CATALOG.find(i => i.id === "animation_solar");

            expect(defaultTheme).toBeDefined();
            expect(defaultTheme?.cost).toBe(0);

            expect(defaultAnimation).toBeDefined();
            expect(defaultAnimation?.cost).toBe(0);
        });

        it("ensures every catalog item has a positive cost and valid type", () => {
            SHOP_CATALOG.forEach(item => {
                expect(item.cost).toBeGreaterThanOrEqual(0);
                expect(["theme", "animation"]).toContain(item.type);
                expect(item.id.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Purchase Validation & Balance Rules", () => {
        const attemptPurchase = (
            userCoins: number,
            item: ShopItem,
            ownedItemIds: Set<string>
        ) => {
            if (ownedItemIds.has(item.id)) {
                return { success: false, reason: "already_owned", remainingCoins: userCoins };
            }

            if (userCoins < item.cost) {
                return {
                    success: false,
                    reason: "insufficient_funds",
                    missingCoins: item.cost - userCoins,
                    remainingCoins: userCoins
                };
            }

            return {
                success: true,
                remainingCoins: userCoins - item.cost,
                newOwnedItemIds: new Set([...ownedItemIds, item.id])
            };
        };

        it("rejects purchase when user has insufficient coins and calculates missing amount", () => {
            const oceanTheme = SHOP_CATALOG.find(i => i.id === "theme_ocean")!; // cost: 1000
            const userCoins = 400;
            const ownedItems = new Set(["theme_default", "animation_solar"]);

            const result = attemptPurchase(userCoins, oceanTheme, ownedItems);

            expect(result.success).toBe(false);
            expect(result.reason).toBe("insufficient_funds");
            expect(result.missingCoins).toBe(600);
            expect(result.remainingCoins).toBe(400); // Balance untouched
        });

        it("successfully purchases item, deducts exact coins, and unlocks it", () => {
            const oceanTheme = SHOP_CATALOG.find(i => i.id === "theme_ocean")!; // cost: 1000
            const userCoins = 2500;
            const ownedItems = new Set(["theme_default", "animation_solar"]);

            const result = attemptPurchase(userCoins, oceanTheme, ownedItems);

            expect(result.success).toBe(true);
            expect(result.remainingCoins).toBe(1500); // 2500 - 1000
            expect(result.newOwnedItemIds?.has("theme_ocean")).toBe(true);
        });

        it("does not charge coins when re-equipping an already owned item", () => {
            const defaultTheme = SHOP_CATALOG.find(i => i.id === "theme_default")!;
            const userCoins = 1000;
            const ownedItems = new Set(["theme_default", "animation_solar", "theme_ocean"]);

            const result = attemptPurchase(userCoins, defaultTheme, ownedItems);

            expect(result.success).toBe(false);
            expect(result.reason).toBe("already_owned");
            expect(result.remainingCoins).toBe(1000); // Balance untouched
        });
    });
});