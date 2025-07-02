'use client';

import calculateSums from "@/utils/utils";
import { useRef, useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    minSum: 0,
    maxSum: 0,
    minDigit: 1,
    maxDigit: 9,
    minCount: 1,
    maxCount: 9,
    maxUniqueDigits: 1,
    ignoredDigits: [] as number[],
    mustHaveDigits: [] as number[],
    exactSums: [] as number[],
    digitCounts: {} as Record<number, { min: number; max: number }>,
  });
  const lastFocusedRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    lastFocusedRef.current = e.target;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentFocus = lastFocusedRef.current;
    setError(null);

    try {
      const rawDigitCounts = formRefs.current.digitCounts?.value || '';
      const digitCounts: Record<number, { min: number; max: number }> = {};

      if (rawDigitCounts.trim()) {
        const parts = rawDigitCounts.split(',').map(part => part.trim());
        for (const entry of parts) {
          const [digitStr, rangeStr] = entry.split(':').map(x => x.trim());
          const digit = parseInt(digitStr);
          if (isNaN(digit) || digit < 1 || digit > 9 || !rangeStr) {
            throw new Error(`Invalid digitCounts entry: "${entry}". Must be like "1:2-5" or "2:3"`);
          }

          if (rangeStr.includes('-')) {
            const [minStr, maxStr] = rangeStr.split('-').map(x => x.trim());
            const min = parseInt(minStr);
            const max = parseInt(maxStr);
            if (isNaN(min) || isNaN(max) || min < 1 || max < min) {
              throw new Error(`Invalid range for digit ${digit}: "${rangeStr}"`);
            }
            digitCounts[digit] = { min, max };
          } else {
            const count = parseInt(rangeStr);
            if (isNaN(count) || count < 1) {
              throw new Error(`Invalid count for digit ${digit}: "${rangeStr}"`);
            }
            digitCounts[digit] = { min: count, max: count };
          }
        }
      }

      const newFormData = {
        minSum: parseInt(formRefs.current.minSum?.value || '0') || 0,
        maxSum: parseInt(formRefs.current.maxSum?.value || '0') || 0,
        minDigit: parseInt(formRefs.current.minDigit?.value || '1') || 1,
        maxDigit: parseInt(formRefs.current.maxDigit?.value || '9') || 9,
        minCount: parseInt(formRefs.current.minCount?.value || '1') || 1,
        maxCount: parseInt(formRefs.current.maxCount?.value || '9') || 9,
        maxUniqueDigits: parseInt(formRefs.current.maxUniqueDigits?.value || '1') || 1,
        ignoredDigits: formRefs.current.ignoredDigits?.value?.split(',').filter(Boolean).map(Number) || [],
        mustHaveDigits: formRefs.current.mustHaveDigits?.value?.split(',').filter(Boolean).map(Number) || [],
        exactSums: formRefs.current.exactSums?.value?.split(',').filter(Boolean).map(Number) || [],
        digitCounts,
      };

      setFormData({ ...newFormData });
    } catch (err) {
      console.error("Error processing form:", err);
      setError(err instanceof Error ? err.message : "An error occurred while processing the form");
    }

    if (currentFocus) {
      setTimeout(() => {
        currentFocus.focus();
        currentFocus.select?.();
      }, 0);
    }
  };

  const InputComponent = ({ label, name, defaultValue, type }: { label: string, name: string, defaultValue: number | string, type?: string }) => {
    return (
      <div className="flex items-center">
        <label className="w-1/4 text-sm font-medium text-gray-700">{label}</label>
        <input
          type={type ?? "number"}
          name={name}
          ref={(el) => { formRefs.current[name] = el; }}
          defaultValue={defaultValue}
          onClick={(e) => e.currentTarget.select()}
          onFocus={handleFocus}
          className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };

  let partitions: Record<number, number[][]> = {};
  let calculationError = null;

  try {
    partitions = calculateSums(
      formData.minSum,
      formData.maxSum,
      formData.minCount,
      formData.maxCount,
      formData.minDigit,
      formData.maxDigit,
      formData.maxUniqueDigits,
      formData.ignoredDigits,
      formData.mustHaveDigits,
      formData.exactSums,
      formData.digitCounts // <-- Pass to your updated backend
    );
  } catch (err) {
    console.error("Error calculating partitions:", err);
    calculationError = err instanceof Error ? err.message : "Error calculating results";
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center bg-white p-8 rounded-lg shadow-lg flex flex-col w-full max-w-4xl items-center">
        <h1 className="text-2xl font-bold text-gray-800">Killer Sudoku Helper</h1>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg flex w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <InputComponent name="exactSums" defaultValue={formData.exactSums.join(',')} label="Exact sums (comma-separated)" type="text" />
          <InputComponent name="minSum" defaultValue={formData.minSum} label="Min sum" />
          <InputComponent name="maxSum" defaultValue={formData.maxSum} label="Max sum" />
          <InputComponent name="minDigit" defaultValue={formData.minDigit} label="Min digit (1-9)" />
          <InputComponent name="maxDigit" defaultValue={formData.maxDigit} label="Max digit (1-9)" />
          <InputComponent name="minCount" defaultValue={formData.minCount} label="Min amount of digits" />
          <InputComponent name="maxCount" defaultValue={formData.maxCount} label="Max amount of digits" />
          <InputComponent name="maxUniqueDigits" defaultValue={formData.maxUniqueDigits} label="Max unique digits" />
          <InputComponent name="ignoredDigits" defaultValue={formData.ignoredDigits.join(',')} label="Ignored digits (comma-separated)" type="text" />
          <InputComponent name="mustHaveDigits" defaultValue={formData.mustHaveDigits.join(',')} label="Must have digits (comma-separated)" type="text" />
          <InputComponent
            name="digitCounts"
            defaultValue={Object.entries(formData.digitCounts).map(([d, c]) => `${d}:${c.min === c.max ? c.min : `${c.min}-${c.max}`}`).join(',')}
            label="Digit counts (e.g. 1:2-5, 2:3)"
            type="text"
          />

          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </form>

        <div className="flex-1 ml-8 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <h3>Max unique digits: <strong>{formData.maxUniqueDigits}</strong></h3>
          {formData.ignoredDigits.length > 0 && <h3>Ignored digits: <strong>{formData.ignoredDigits.join(', ')}</strong></h3>}
          {formData.mustHaveDigits.length > 0 && <h3>Must have digits: <strong>{formData.mustHaveDigits.join(', ')}</strong></h3>}
          {Object.keys(formData.digitCounts).length > 0 && (
            <h3>Digit counts: <strong>{
              Object.entries(formData.digitCounts).map(([digit, range]) =>
                `${digit}×${range.min === range.max ? range.min : `${range.min}-${range.max}`}`
              ).join(', ')
            }</strong></h3>
          )}
          <h2 className="text-lg font-semibold text-gray-800 flex flex-col items-center">Results</h2>
          {calculationError ? (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Calculation Error:</strong> {calculationError}
            </div>
          ) : (
            Object.entries(partitions).map(([sum, combinations]) => (
              <div key={sum}>
                <p><strong>Sum:</strong> {sum}</p>
                <ul>
                  {combinations.map((combination, index) => (
                    <div key={index} className="flex space-x-1">
                      <input type="checkbox" />
                      <div>{combination.join(' + ')}</div>
                    </div>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
