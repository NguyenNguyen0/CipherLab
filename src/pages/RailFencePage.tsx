import React, { useState } from "react";
import { RailFenceCipher } from "../utils/RailFenceCipher";

interface FormState {
  key: string;
  plaintext: string;
  transpositionTime: string;
}

interface FormErrors {
  key?: string;
  plaintext?: string;
  transpositionTime?: string;
}

interface EncryptionStep {
  columnMap: Record<string, string[]>;
  keyOrder: Array<{ char: string; index: number; displayChar: string }>;
  tableData: string[][];
  tableHeaders: Array<{ char: string; displayChar: string; order: number }>;
  intermediateText: string;
}

const RailFencePage: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    key: "",
    plaintext: "",
    transpositionTime: "1",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<string>("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [encryptionSteps, setEncryptionSteps] = useState<EncryptionStep[]>([]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Key validation (must be a non-empty string)
    if (!formState.key.trim()) {
      errors.key = "Key must not be empty";
      isValid = false;
    }

    // Plaintext validation (must not be empty)
    if (!formState.plaintext.trim()) {
      errors.plaintext = "Text cannot be empty";
      isValid = false;
    }

    // Transposition time validation (must be a positive integer)
    const transpositionTime = parseInt(formState.transpositionTime);
    if (
      !formState.transpositionTime ||
      isNaN(transpositionTime) ||
      transpositionTime <= 0
    ) {
      errors.transpositionTime = "Transposition time must be a positive integer";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value as "encrypt" | "decrypt");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const transpositionTime = parseInt(formState.transpositionTime);
      
      if (mode === "encrypt") {
        const result = RailFenceCipher.encrypt(
          formState.plaintext,
          formState.key,
          transpositionTime
        );
        setResult(result.ciphertext);
        setEncryptionSteps(result.steps);
      } else {
        const decrypted = RailFenceCipher.decrypt(
          formState.plaintext,
          formState.key,
          transpositionTime
        );
        setResult(decrypted);
        setEncryptionSteps([]);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Rail Fence Cipher</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Mode</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="encrypt"
                  checked={mode === "encrypt"}
                  onChange={handleModeChange}
                  className="mr-2"
                />
                Encrypt
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="decrypt"
                  checked={mode === "decrypt"}
                  onChange={handleModeChange}
                  className="mr-2"
                />
                Decrypt
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="key" className="block text-sm font-medium mb-2">
              Key (string)
            </label>
            <input
              type="text"
              id="key"
              name="key"
              value={formState.key}
              onChange={handleInputChange}
              placeholder="Enter key (e.g. 'midnight')"
              className="w-full px-3 py-2 border rounded-md"
            />
            {formErrors.key && (
              <p className="text-red-500 text-sm mt-1">{formErrors.key}</p>
            )}
          </div>

          <div>
            <label htmlFor="plaintext" className="block text-sm font-medium mb-2">
              {mode === "encrypt" ? "Plaintext" : "Ciphertext"}
            </label>
            <textarea
              id="plaintext"
              name="plaintext"
              value={formState.plaintext}
              onChange={handleInputChange}
              rows={4}
              placeholder={`Enter ${
                mode === "encrypt" ? "plaintext" : "ciphertext"
              }`}
              className="w-full px-3 py-2 border rounded-md"
            ></textarea>
            {formErrors.plaintext && (
              <p className="text-red-500 text-sm mt-1">{formErrors.plaintext}</p>
            )}
          </div>

          <div>
            <label htmlFor="transpositionTime" className="block text-sm font-medium mb-2">
              Transposition Times
            </label>
            <input
              type="number"
              id="transpositionTime"
              name="transpositionTime"
              value={formState.transpositionTime}
              onChange={handleInputChange}
              min="1"
              placeholder="Enter number of transpositions"
              className="w-full px-3 py-2 border rounded-md"
            />
            {formErrors.transpositionTime && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.transpositionTime}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            {mode === "encrypt" ? "Encrypt" : "Decrypt"}
          </button>
        </form>
      </div>

      {/* Result display */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Result</h2>
        <div className="border rounded-md p-4 bg-gray-50 min-h-[100px] whitespace-pre-wrap">
          {result || "Result will appear here"}
        </div>
      </div>

      {/* Visualization Steps */}
      {mode === "encrypt" && encryptionSteps.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Encryption Process</h2>
          
          {encryptionSteps.map((step, stepIndex) => (
            <div key={stepIndex} className="mb-8">
              <h3 className="text-lg font-medium mb-3">
                Transposition #{stepIndex + 1}
              </h3>
              
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      {step.tableHeaders.map((header, idx) => (
                        <th 
                          key={idx} 
                          className="border border-gray-300 p-2 bg-gray-100 text-center"
                        >
                          {header.displayChar}({header.order})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {step.tableData.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <td 
                            key={cellIdx} 
                            className="border border-gray-300 p-2 text-center"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Display columns after sorting */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Columns after sorting:</h4>
                <div className="flex flex-wrap gap-4">
                  {step.keyOrder.map((item, idx) => {
                    const column = step.columnMap[item.char] || [];
                    return (
                      <div key={idx} className="bg-gray-50 p-2 rounded border">
                        <div className="font-bold text-center mb-1">{item.displayChar}</div>
                        <div>{column.join('')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Display result of this transposition */}
              <div>
                <h4 className="text-md font-medium mb-2">Resulting text:</h4>
                <div className="bg-gray-50 p-3 rounded border">
                  {step.intermediateText}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RailFencePage;