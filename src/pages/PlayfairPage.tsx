import React, { useState } from 'react';
import PlayfairCipher from '../utils/PlayfairCipher';
import type { PlayfairResult } from '../utils/PlayfairCipher';

const PlayfairPage: React.FC = () => {
  const [key, setKey] = useState<string>('');
  const [plaintext, setPlaintext] = useState<string>('');
  const [separateChar, setSeparateChar] = useState<string>('x');
  const [insertCharAtLast, setInsertCharAtLast] = useState<boolean>(true);
  const [result, setResult] = useState<string>('');
  const [playfairResult, setPlayfairResult] = useState<PlayfairResult | null>(null);
  const [errors, setErrors] = useState<{
    key?: string;
    plaintext?: string;
    separateChar?: string;
  }>({});

  const validateInputs = (): boolean => {
    const newErrors: {
      key?: string;
      plaintext?: string;
      separateChar?: string;
    } = {};

    if (!key.trim()) {
      newErrors.key = 'Key is required';
    }

    if (!plaintext.trim()) {
      newErrors.plaintext = 'Plaintext is required';
    }

    if (!separateChar || separateChar.length !== 1) {
      newErrors.separateChar = 'Separate character must be a single character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEncrypt = () => {
    if (validateInputs()) {
      try {
        const result = PlayfairCipher.encrypt({
          key,
          plaintext,
          separateChar,
          insertCharAtLast
        });
        
        setPlayfairResult(result);
        setResult(result.ciphertext);
      } catch (error) {
        if (error instanceof Error) {
          setErrors(prev => ({ ...prev, key: error.message }));
        }
        setResult('');
        setPlayfairResult(null);
      }
    } else {
      setResult('');
      setPlayfairResult(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Playfair Cipher</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Key:</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter encryption key"
        />
        {errors.key && <p className="text-red-500 text-sm mt-1">{errors.key}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Plaintext:</label>
        <textarea
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          placeholder="Enter text to encrypt"
        ></textarea>
        {errors.plaintext && <p className="text-red-500 text-sm mt-1">{errors.plaintext}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Separate Character:</label>
        <input
          type="text"
          value={separateChar}
          onChange={(e) => setSeparateChar(e.target.value)}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter separate character (default: x)"
          maxLength={1}
        />
        {errors.separateChar && <p className="text-red-500 text-sm mt-1">{errors.separateChar}</p>}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="insertCharAtLast"
            checked={insertCharAtLast}
            onChange={(e) => setInsertCharAtLast(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
          />
          <label htmlFor="insertCharAtLast" className="text-sm text-gray-700">
            Insert separator at end for odd-length plaintext
          </label>
        </div>
      </div>
      
      {/* Process Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleEncrypt}
          className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Encrypt
        </button>
      </div>
      
      {/* Matrix Display */}
      {playfairResult && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Playfair Matrix</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <table className="mx-auto border-collapse">
              <tbody>
                {playfairResult.matrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((char, colIndex) => (
                      <td 
                        key={colIndex}
                        className="w-12 h-10 text-center border border-indigo-200 bg-indigo-100 font-mono uppercase"
                      >
                        {char === 'i' ? 'I/J' : char.toUpperCase()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Processed Plaintext */}
      {playfairResult && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Processed Plaintext</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-mono text-gray-800 text-lg">
              Original: <span className="text-blue-600">{plaintext}</span>
            </p>
            <p className="font-mono text-gray-800 text-lg">
              Processed: <span className="text-green-600">{playfairResult.processedPlaintext}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Note: All J's are treated as I's in the Playfair cipher.
            </p>
          </div>
        </div>
      )}

      {/* Encryption Steps */}
      {playfairResult && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Encryption Steps</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-60 overflow-y-auto">
            <div className="space-y-3 font-mono">
              {playfairResult.digraphs.map((digraph, index) => (
                <div key={index} className="flex space-x-4">
                  <span className="w-8 text-gray-500">{index + 1}.</span>
                  <span className="w-20">{digraph.plaintext.toUpperCase()}</span>
                  <span className="w-6">→</span>
                  <span className="text-indigo-600">{digraph.ciphertext.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Result</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          {result ? (
            <p className="font-mono text-gray-800 text-lg uppercase">{result}</p>
          ) : (
            <p className="text-gray-500 text-center">Result will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayfairPage;