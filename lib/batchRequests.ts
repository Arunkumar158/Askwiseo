// lib/batchRequests.ts

/**
 * Execute multiple async request functions in parallel and return their results.
 * If any request rejects, the error is thrown so the caller can handle it.
 *
 * @param tasks Array of functions returning a Promise of type T.
 * @returns Array of resolved values in the same order as the input tasks.
 */
export async function batchRequests<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
  const settled = await Promise.allSettled(tasks.map((t) => t()));
  const results: T[] = [];
  for (const item of settled) {
    if (item.status === "fulfilled") {
      results.push(item.value);
    } else {
      // Propagate the first error – callers can wrap in try/catch.
      throw item.reason;
    }
  }
  return results;
}
