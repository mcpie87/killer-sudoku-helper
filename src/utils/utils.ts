/**
 * Calculates all possible combinations of digits that sum up to target values within given constraints.
 * @param minSum - Minimum target sum
 * @param maxSum - Maximum target sum
 * @param minCount - Minimum number of digits in each combination
 * @param maxCount - Maximum number of digits in each combination
 * @param minDigit - Minimum digit value
 * @param maxDigit - Maximum digit value
 * @param maxUniqueDigits - Maximum number of unique digits allowed (default: 1)
 * @returns Record mapping target sums to arrays of valid digit combinations
 */
function calculateSums(
  minSum: number,
  maxSum: number,
  minCount: number,
  maxCount: number,
  minDigit: number,
  maxDigit: number,
  maxUniqueDigits: number = 1,
  ignoredDigits: number[] = [],
  mustHaveDigits: number[] = [],
  exactSums: number[] = []
): Record<number, number[][]> {
  // Input validation
  if (
    minSum < 0 ||
    maxSum < minSum ||
    minCount < 1 ||
    maxCount < minCount ||
    minDigit < 0 ||
    maxDigit < minDigit ||
    maxUniqueDigits < 1
  ) {
    throw new Error('Invalid input parameters');
  }

  const results: Record<number, number[][]> = {};

  /**
   * Recursively finds digit combinations that sum to target
   * @param targetSum - Original target sum
   * @param remainingSum - Remaining sum to achieve
   * @param currentCombo - Current combination of digits
   * @param digitCounts - Map of digit to its count
   */
  function findCombinations(
    targetSum: number,
    remainingSum: number,
    currentCombo: number[],
    digitCounts: Map<number, number> = new Map()
  ): void {
    // Base case: valid combination found
    if (
      remainingSum === 0 &&
      currentCombo.length >= minCount &&
      currentCombo.length <= maxCount &&
      mustHaveDigits.every((digit) => currentCombo.includes(digit))
    ) {
      results[targetSum] = results[targetSum] || [];
      results[targetSum].push([...currentCombo]);
      return;
    }

    // Early termination: no valid solution possible
    if (remainingSum < 0 || currentCombo.length > maxCount) {
      return;
    }

    const lastDigit = currentCombo[currentCombo.length - 1] ?? minDigit;
    for (let digit = lastDigit; digit <= maxDigit; digit++) {
      if (ignoredDigits.includes(digit)) {
        continue;
      }

      const currentCount = digitCounts.get(digit) || 0;
      if (currentCount >= maxUniqueDigits) {
        continue;
      }

      if (remainingSum - digit < 0) {
        break; // Early break if remaining sum becomes negative
      }

      currentCombo.push(digit);
      digitCounts.set(digit, currentCount + 1);

      findCombinations(targetSum, remainingSum - digit, currentCombo, digitCounts);

      currentCombo.pop();
      if (currentCount === 0) {
        digitCounts.delete(digit);
      } else {
        digitCounts.set(digit, currentCount);
      }
    }
  }

  // Process each target sum
  if (exactSums.length > 0) {
    exactSums.forEach((sum) => {
      findCombinations(sum, sum, []);
      // results[sum] = results[sum] || [];
      // results[sum].push([sum]);
    });
    return results;
  }
  for (let sum = minSum; sum <= maxSum; sum++) {
    findCombinations(sum, sum, []);
  }

  return results;
}

export default calculateSums;