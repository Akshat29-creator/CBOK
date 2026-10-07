/**
 * Mulberry32 32-bit PRNG for reproducible random initialization
 */
export class PRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Sample from uniform distribution [-scale, scale]
   */
  public uniform(scale: number = 0.5): number {
    return (this.next() * 2 - 1) * scale;
  }

  /**
   * Sample from standard normal distribution (Box-Muller)
   */
  public gaussian(mean: number = 0, stdDev: number = 0.1): number {
    const u1 = Math.max(1e-10, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}
