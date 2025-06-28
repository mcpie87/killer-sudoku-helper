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
  });

  const [error, setError] = useState<string | null>(null);

  // Use refs to store current form values without triggering re-renders
  const formRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    try {
      // Collect all current values from the form inputs
      const newFormData = {
        minSum: parseInt(formRefs.current.minSum?.value || '0') || 0,
        maxSum: parseInt(formRefs.current.maxSum?.value || '0') || 0,
        minDigit: parseInt(formRefs.current.minDigit?.value || '1') || 1,
        maxDigit: parseInt(formRefs.current.maxDigit?.value || '9') || 9,
        minCount: parseInt(formRefs.current.minCount?.value || '1') || 1,
        maxCount: parseInt(formRefs.current.maxCount?.value || '9') || 9,
        maxUniqueDigits: parseInt(formRefs.current.maxUniqueDigits?.value || '1') || 1,
      };

      console.log("Submitted", newFormData);
      setFormData(newFormData);
    } catch (err) {
      console.error("Error processing form:", err);
      setError(err instanceof Error ? err.message : "An error occurred while processing the form");
    }
  };

  const NumberInputComponent = ({ label, name, defaultValue }: { label: string, name: string, defaultValue: number }) => {
    return (
      <div className="flex items-center">
        <label className="w-1/4 text-sm font-medium text-gray-700">{label}</label>
        <input
          type="number"
          name={name}
          ref={(el) => { formRefs.current[name] = el; }}
          defaultValue={defaultValue}
          onClick={(e) => e.currentTarget.select()}
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
      formData.maxUniqueDigits
    );
    console.log("Form data", formData);
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
          <NumberInputComponent name="minSum" defaultValue={formData.minSum} label="Min sum" />
          <NumberInputComponent name="maxSum" defaultValue={formData.maxSum} label="Max sum" />
          <NumberInputComponent name="minDigit" defaultValue={formData.minDigit} label="Min digit (1-9)" />
          <NumberInputComponent name="maxDigit" defaultValue={formData.maxDigit} label="Max digit (1-9)" />
          <NumberInputComponent name="minCount" defaultValue={formData.minCount} label="Min amount of digits" />
          <NumberInputComponent name="maxCount" defaultValue={formData.maxCount} label="Max amount of digits" />
          <NumberInputComponent name="maxUniqueDigits" defaultValue={formData.maxUniqueDigits} label="Max unique digits" />
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
          <h2 className="text-lg font-semibold text-gray-800">Results (Max unique: {formData.maxUniqueDigits})</h2>
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
                    <li key={index}>{combination.join(' + ')}</li>
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