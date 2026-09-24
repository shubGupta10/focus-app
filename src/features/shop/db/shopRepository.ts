import { SQLiteDatabase } from "expo-sqlite";

export async function getPurchasedItems(db: SQLiteDatabase): Promise<string[]> {
    try {
        const result = await db.getAllAsync<{ item_id: string }>(
            "SELECT item_id FROM shop_purchases"
        );
        return result.map(row => row.item_id);
    } catch (error) {
        console.error("Failed to fetch purchased items", error);
        return [];
    }
}

export async function purchasedItem(db: SQLiteDatabase, itemId: string, cost: number): Promise<boolean> {
    try {
        await db.withTransactionAsync(async () => {
            const updatedResult = await db.runAsync(
                "UPDATE user_stats SET total_coins = total_coins - ? WHERE id = 1 AND total_coins >= ?",
                [cost, cost]
            );
            if (updatedResult.changes === 0 && cost > 0) {
                throw new Error("Not enough coins");
            }

            await db.runAsync(
                "INSERT INTO shop_purchases (item_id, purchased_at) VALUES (?, ?)",
                [itemId, Date.now()]
            );
        });

        return true;
    } catch (error) {
        console.error("Failed to purchase item", error);
        return false;
    }
}
