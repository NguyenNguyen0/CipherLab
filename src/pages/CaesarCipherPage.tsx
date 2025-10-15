import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import CaesarCipher from '../utils/CaesarCipher';

type Step = {
  plaintext: string;
  numericValue: number;
  computation: string;
  result: number;
  resultChar: string;
};

const CaesarCipherPage = () => {
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [vietnameseEnabled, setVietnameseEnabled] = useState(false);
  const [text, setText] = useState('');
  const [shift, setShift] = useState(13); // Default to 13 as per your example
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState('');
  
  const processText = () => {
    if (text.trim() === '') {
      setSteps([]);
      setResult('');
      return;
    }
    
    let processedResult = '';
    let processSteps: Step[] = [];
    
    if (mode === 'encode') {
      if (vietnameseEnabled) {
        processedResult = CaesarCipher.encodeVietnamese(text, shift);
        processSteps = CaesarCipher.solveEncodeVietnamese(text, shift);
      } else {
        processedResult = CaesarCipher.encode(text, shift);
        processSteps = CaesarCipher.solveEncode(text, shift);
      }
    } else {
      if (vietnameseEnabled) {
        processedResult = CaesarCipher.decodeVietnamese(text, shift);
        processSteps = CaesarCipher.solveDecodeVietnamese(text, shift);
      } else {
        processedResult = CaesarCipher.decode(text, shift);
        processSteps = CaesarCipher.solveDecode(text, shift);
      }
    }
    
    setResult(processedResult);
    setSteps(processSteps);
  };
  
  // Process the text whenever shift, mode, or vietnameseEnabled changes
  useEffect(() => {
    if (text.trim() !== '') {
      processText();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shift, mode, vietnameseEnabled, text]);
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Caesar Cipher</h1>
      
      {/* Mode Switch */}
      <div className="flex justify-center items-center mb-6 space-x-3">
        <span className={`text-sm font-medium ${mode === 'encode' ? 'text-gray-500' : 'text-gray-900'}`}>
          Decode
        </span>
        <Switch
          checked={mode === 'encode'}
          onChange={() => setMode(mode === 'encode' ? 'decode' : 'encode')}
          className={`${
            mode === 'encode' ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              mode === 'encode' ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
        <span className={`text-sm font-medium ${mode === 'encode' ? 'text-gray-900' : 'text-gray-500'}`}>
          Encode
        </span>
      </div>
      
      {/* Shift and Vietnamese Options */}
      <div className="flex items-center justify-between mb-6">
        {/* Shift Selection */}
        <div className="flex items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift (Key)
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                max={vietnameseEnabled ? 28 : 25}
                className="w-20 px-2 py-1 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={shift}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const maxShift = vietnameseEnabled ? 28 : 25;
                  if (value >= 1 && value <= maxShift) {
                    setShift(value);
                  }
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {mode === 'encode' 
                ? `Formula: y = (x + shift) mod ${vietnameseEnabled ? '29' : '26'}` 
                : `Formula: x = (y - shift) mod ${vietnameseEnabled ? '29' : '26'}`}
            </div>
          </div>
        </div>
        
        {/* Vietnamese Option */}
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              checked={vietnameseEnabled}
              onChange={() => setVietnameseEnabled(!vietnameseEnabled)}
            />
            <span className="ml-2 text-sm text-gray-700">
              Enable Vietnamese alphabet (29 characters)
            </span>
          </label>
        </div>
      </div>
      
      {/* Input/Output Text Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'encode' ? 'Plaintext' : 'Ciphertext'}
        </label>
        <textarea
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter text to encrypt' : 'Enter text to decrypt'}
        />
      </div>
      
      {/* Process Button */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={processText}
        >
          {mode === 'encode' ? 'Encrypt' : 'Decrypt'}
        </button>
      </div>

      {/* Step by Step Result */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Step-by-Step Solution</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-60 overflow-y-auto">
          {steps.length > 0 ? (
            <div className="space-y-6 leading-relaxed">
              {steps.map((step, index) => (
                <div key={index} className="font-mono text-gray-700">
                  <p>
                    {mode === 'encode' ? 'Plaintext' : 'Ciphertext'}: {step.plaintext} → {step.numericValue.toString().padStart(2, '0')}
                  </p>
                  <p>
                    {mode === 'encode' ? 'Encryption' : 'Decryption'}: {step.computation}
                  </p>
                  <p>
                    {mode === 'encode' ? 'Ciphertext' : 'Plaintext'}: {step.result.toString().padStart(2, '0')} → {step.resultChar.toUpperCase()}
                  </p>
                  {index < steps.length - 1 && <div className="mt-2"></div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Solution steps will appear here</p>
          )}
        </div>
      </div>
      
      {/* Result */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Result</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          {result ? (
            <p className="font-mono text-gray-800 text-lg">{result}</p>
          ) : (
            <p className="text-gray-500 text-center">Result will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaesarCipherPage;