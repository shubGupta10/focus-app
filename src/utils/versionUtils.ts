export function isNewerVersion(remoteVersion: string, currentVersion: string): boolean {
    const cleanRemote = remoteVersion.replace(/^v/i, "").trim();
    const cleanCurrent = currentVersion.replace(/^v/i, "").trim();
    const r = cleanRemote.split(".").map((n) => parseInt(n, 10) || 0);
    const c = cleanCurrent.split(".").map((n) => parseInt(n, 10) || 0);
    const length = Math.max(r.length, c.length);
    for (let i = 0; i < length; i++) {
        const rNum = r[i] || 0;
        const cNum = c[i] || 0;
        if (rNum > cNum) return true;
        if (rNum < cNum) return false;
    }
    return false;
}
