# Bug Register

| Bug ID | Description | Severity | Reproduction steps | Expected result | Actual result | Owner | Status | Fix/commit | Retest result | Regression result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | Ride ordering logic reversed the chronology of the ride list and mutated the source array while sorting. | High | 1. Create an array of rides with dates in mixed order. 2. Call `sortRides(...)`. 3. Inspect the returned list and the original array. | Newest rides appear first and the original array remains unchanged. | Returned list was oldest-first and the input array got mutated in place. | CarpoolApp Team | Fixed | Local fix in `lib/utils.ts`: non-mutating sort with a copied array and descending timestamp comparison. | Pass — 11/11 tests passed after fix. | No regressions in the current suite. |
