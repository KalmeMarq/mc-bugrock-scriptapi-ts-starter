const profiles: Record<string, number> = {};

export function profileStart(name: string) {
  const date = new Date();

  console.log(`[${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}:${`${date.getSeconds()}`.padStart(2, '0')}] Starting '\x1b[36m${name}\x1b[39m'...`);

  profiles[name] = performance.now();
}

export function profileEnd(name: string) {
  const ms = performance.now() - profiles[name];
  const date = new Date();
  console.log(`[${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}:${`${date.getSeconds()}`.padStart(2, '0')}] Finished '\x1b[36m${name}\x1b[39m' after \x1b[35m${ms.toFixed(2)}\x1b[39m ms`);
}
