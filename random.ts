export function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number) {
    return Math.floor(randomRange(min, max + 1));
}

export function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
