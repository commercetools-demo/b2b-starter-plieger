/**
 * Interface for a generative seed.
 */
export interface iSeed {
   /**
    * Returns the next random value (float [0, 1)).
    */
   next(): number

   /**
    * Picks a random element from the provided array.
    */
   pick<T>(arr: T[]): T
}



/**
 * Creates a deterministic seed generator from a generic input.
 *
 * @param initialSeed - The value used to initialize the generator
 */
export const Seed = <T>(initialSeed: T): iSeed => {
   /**
    * 64-bit FNV-1a hashing logic to turn any input into a deterministic BigInt.
    * Uses a purely functional pipeline (no loops, no mutations).
    */
   const toBigIntSeed = <T>(val: T): bigint => 
   typeof val === 'bigint' ? val :
   typeof val === 'number' ? BigInt(Math.floor(val)) :
   Array.from(typeof val === 'string' ? val : JSON.stringify(val)).reduce(
      (hash, char) => (hash ^ BigInt(char.charCodeAt(0))) * 0x01000193n & 0xFFFFFFFFFFFFFFFFn,
      0x811c9dc5n
   );

   // Single immutable reference to a state object to maintain the sequence without 'let'
   const state = { value: toBigIntSeed(initialSeed) };

   const step = (): number => {
      const s1 = state.value ^ (state.value >> 12n);
      const s2 = s1 ^ (s1 << 25n);
      const s3 = s2 ^ (s2 >> 27n);
      state.value = (s3 * 0x2545F4914F6CDD1Dn) & 0xFFFFFFFFFFFFFFFFn;
      return Number(state.value) / Number(0xFFFFFFFFFFFFFFFFn + 1n);
   };

   return {
      next: step,
      pick: <U>(arr: U[]): U => arr[Math.floor(step() * arr.length)]
   };
};

// Verification block - using forEach and Array.from to avoid 'let' based loops
if (import.meta.main) {
   const s = Seed({ key: "functional-example", timestamp: 1705665600000 });
   
   console.log("--- Deterministic Sequence (No 'let') ---");
   Array.from({ length: 5 }).forEach((_, i) => 
      console.log(`Value ${i + 1}:`, s.next())
   );

   const guid = Seed("ba3ca4c5-ecb8-4086-a18f-b9ba73f3889d")
   console.log("Guid Next:", guid.next())

   const num = Seed(100)
   console.log("Num Next:", num.next()) 
   
      const date = Seed(new Date("1-1-2026"))
   console.log("Date Next:", date.next())   

   const prices = [10, 20, 30, 40, 50]
   const priceSeed = Seed(10)
   console.log("Pick from Prices:", priceSeed.pick(prices))
   
}