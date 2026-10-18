export function plural(n: number, noun: string): string {
  return `${String(n)} ${noun}${n === 1 ? "" : "s"}`;
}
