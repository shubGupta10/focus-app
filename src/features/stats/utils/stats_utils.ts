export function formatCoinBalance(num: number): string {
    if (num < 100000) {
        return num.toLocaleString();
    }
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num);
}