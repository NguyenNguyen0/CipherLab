import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import RsaCipher from "../utils/RsaCipher";
import type {
  RsaKeyGenResult,
  RsaOperationResult,
  EuclideanStep,
  ModExpStep,
} from "../utils/RsaCipher";

import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const RsaPage = () => {
  // Key generation parameters
  const [p, setP] = useState<number>(0);
  const [q, setQ] = useState<number>(0);
  const [e, setE] = useState<number>(0);
  const [possibleE, setPossibleE] = useState<number[]>([]);

  // Operation parameters
  const [message, setMessage] = useState<number>(0);
  const [result, setResult] = useState<{
    encryption: number | null;
    decryption: number | null;
    signature: number | null;
    verification: number | null;
  }>({
    encryption: null,
    decryption: null,
    signature: null,
    verification: null,
  });

  // Security operation mode
  const [securityMode, setSecurityMode] = useState<
    "confidentiality" | "authenticity" | "both"
  >("confidentiality");
  const [keyGenResult, setKeyGenResult] = useState<RsaKeyGenResult | null>(null);
  const [encryptResult, setEncryptResult] = useState<RsaOperationResult | null>(null);
  const [decryptResult, setDecryptResult] = useState<RsaOperationResult | null>(null);
  const [signResult, setSignResult] = useState<RsaOperationResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<RsaOperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FME Modal state
  const [showFmeModal, setShowFmeModal] = useState<boolean>(false);
  const [fmeBase, setFmeBase] = useState<number>(0);
  const [fmeExponent, setFmeExponent] = useState<number>(0);
  const [fmeModulus, setFmeModulus] = useState<number>(0);
  const [fmeResult, setFmeResult] = useState<RsaOperationResult | null>(null);
  const [fmeError, setFmeError] = useState<string | null>(null);

  // Generate possible e values when p and q change
  useEffect(() => {
    const validEValues =
      RsaCipher.isPrime(p) && RsaCipher.isPrime(q)
        ? RsaCipher.getValidPublicExponents(p, q)
        : [];

    setPossibleE(validEValues);

    // Set default e if not set or not valid
    if (validEValues.length > 0 && !validEValues.includes(e)) {
      setE(validEValues[0]);
    }
  }, [p, q, e]);

  // Generate RSA keys
  const generateKeys = () => {
    setError(null);
    try {
      const result = RsaCipher.generateKeyPair(p, q, e);
      setKeyGenResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during key generation");
      }
      setKeyGenResult(null);
    }
  };

  // Perform all RSA operations (encryption, decryption, signing, verification)
  const performOperations = () => {
    setError(null);
    if (!keyGenResult) {
      setError("Generate keys first");
      return;
    }

    try {
      // Always perform all calculations but show based on security mode
      if (securityMode === "confidentiality") {
        // Encryption (using public key)
        const encryptionResult = RsaCipher.encrypt(
          message,
          keyGenResult.keyPair.publicKey
        );
        setEncryptResult(encryptionResult);

        // Decryption (using private key)
        const decryptionResult = RsaCipher.decrypt(
          encryptionResult.result,
          keyGenResult.keyPair.privateKey
        );
        setDecryptResult(decryptionResult);

        // Still calculate these for state completeness
        const signResult = RsaCipher.sign(
          message,
          keyGenResult.keyPair.privateKey
        );
        setSignResult(signResult);

        const verifyResult = RsaCipher.verify(
          signResult.result,
          keyGenResult.keyPair.publicKey
        );
        setVerifyResult(verifyResult);

        // Update result state
        setResult({
          encryption: encryptionResult.result,
          decryption: decryptionResult.result,
          signature: signResult.result,
          verification: verifyResult.result,
        });
      } else if (securityMode === "authenticity") {
        // Signing (using private key)
        const signResult = RsaCipher.sign(
          message,
          keyGenResult.keyPair.privateKey
        );
        setSignResult(signResult);

        // Verification (using public key)
        const verifyResult = RsaCipher.verify(
          signResult.result,
          keyGenResult.keyPair.publicKey
        );
        setVerifyResult(verifyResult);

        // Still calculate these for state completeness
        const encryptionResult = RsaCipher.encrypt(
          message,
          keyGenResult.keyPair.publicKey
        );
        setEncryptResult(encryptionResult);

        const decryptionResult = RsaCipher.decrypt(
          encryptionResult.result,
          keyGenResult.keyPair.privateKey
        );
        setDecryptResult(decryptionResult);

        // Update result state
        setResult({
          encryption: encryptionResult.result,
          decryption: decryptionResult.result,
          signature: signResult.result,
          verification: verifyResult.result,
        });
      } else if (securityMode === "both") {
        // For both confidentiality and authenticity
        // Encryption (using both keys)
        const encryptionResult = RsaCipher.encryptWithBoth(
          message,
          keyGenResult.keyPair.privateKey,
          keyGenResult.keyPair.publicKey
        );
        setEncryptResult(encryptionResult);

        // Decryption (using both keys)
        const decryptionResult = RsaCipher.decryptWithBoth(
          encryptionResult.result,
          keyGenResult.keyPair.privateKey,
          keyGenResult.keyPair.publicKey
        );
        setDecryptResult(decryptionResult);

        // For state completeness, these won't be shown but keep them calculated
        const signResult = RsaCipher.sign(
          message,
          keyGenResult.keyPair.privateKey
        );
        setSignResult(signResult);

        const verifyResult = RsaCipher.verify(
          signResult.result,
          keyGenResult.keyPair.publicKey
        );
        setVerifyResult(verifyResult);

        // Update result state
        setResult({
          encryption: encryptionResult.result,
          decryption: decryptionResult.result,
          signature: signResult.result,
          verification: verifyResult.result,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during operations");
      }
    }
  };

  // Calculate custom Fast Modular Exponentiation
  const calculateFme = () => {
    setFmeError(null);

    try {
      // Using the modExpWithSteps function to calculate and track steps
      const { result, steps } = RsaCipher.modExpWithSteps(
        fmeBase,
        fmeExponent,
        fmeModulus
      );

      setFmeResult({
        message: fmeBase,
        result: result,
        steps: steps,
      });
    } catch (err) {
      if (err instanceof Error) {
        setFmeError(err.message);
      } else {
        setFmeError("An error occurred during calculation");
      }
      setFmeResult(null);
    }
  };

  // Render Euclidean algorithm steps table
  const renderEuclideanStepsTable = (steps: EuclideanStep[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="q" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="r_1" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="r_2" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="r" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="t_1" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="t_2" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="t" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {steps.map((step, index) => (
            <tr key={index} className={index % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.q}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.r1}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.r2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.r}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.t1}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.t2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.t}`} />
              </td>
            </tr>
          ))}
          {steps.length > 0 && (
            <tr className={steps.length % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="px-3 py-2 text-center text-sm font-mono"></td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].r2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].r}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono"></td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].t2}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${steps[steps.length - 1].t}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Render modular exponentiation steps table
  const renderModExpStepsTable = (steps: ModExpStep[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="b[i]" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="p = p^2" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="p = p \mod n" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="p \cdot z" />
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 tracking-wider">
              <InlineMath math="p = p \mod n" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {steps.map((step, index) => (
            <tr key={index} className={index % 2 ? "bg-gray-50" : "bg-white"}>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.bit}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.pSquared}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.pMod}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.z || "-"}`} />
              </td>
              <td className="px-3 py-2 text-center text-sm font-mono">
                <InlineMath math={`${step.result}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Key generation content with operations
  const renderKeyGenerationContent = () => {
    return (
      <div className="space-y-6">
        {/* P and Q inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              P (Prime Number)
            </label>
            <input
              type="number"
              min="2"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={p}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  setP(value);
                }
              }}
            />
            {!RsaCipher.isPrime(p) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a prime number
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Q (Prime Number)
            </label>
            <input
              type="number"
              min="2"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={q}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  setQ(value);
                }
              }}
            />
            {!RsaCipher.isPrime(q) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a prime number
              </p>
            )}
          </div>
        </div>

        {/* E selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E (Public Exponent)
          </label>
          <select
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={e}
            onChange={(e) => setE(parseInt(e.target.value))}
            disabled={possibleE.length === 0}
          >
            {possibleE.length > 0 ? (
              possibleE.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))
            ) : (
              <option value={0}>Please enter valid P and Q first</option>
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            E must be coprime with (P-1)*(Q-1)
          </p>
        </div>

        {/* Generate button */}
        <div className="flex justify-center">
          <button
            type="button"
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={generateKeys}
          >
            Generate Keys
          </button>
        </div>

        {/* Key generation results */}
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          keyGenResult && (
            <div className="space-y-4">
              {/* Step 1-2: Select p, q and calculate n */}
              <div>
                <h3 className="text-md font-bold">
                  1. Select prime numbers p and q
                </h3>
                <p className="ml-3">
                  <InlineMath math={`p = ${p}, q = ${q}`} />
                </p>
                <p className="mt-2 font-bold">2. Calculate modulus:</p>
                <p className="ml-3">
                  <InlineMath
                    math={`n = p \\times q = ${p} \\times ${q} = ${keyGenResult.params.n}`}
                  />
                </p>
              </div>

              {/* Step 3: Calculate totient */}
              <div className="mt-3">
                <p className="font-bold">
                  3. Calculate Euler's totient function:
                </p>
                <p className="ml-3">
                  <InlineMath
                    math={`\\phi(n) = (p-1)(q-1) = (${p}-1)(${q}-1) = ${keyGenResult.params.totient}`}
                  />
                </p>
              </div>

              {/* Step 4: Select e */}
              <div className="mt-3">
                <p className="font-bold">
                  4. Select public exponent <InlineMath math="e" /> such that:
                </p>
                <p className="ml-3">
                  <InlineMath math={`\\gcd(\\phi(n), e) = 1`} />
                </p>
                <p className="ml-3">
                  <InlineMath math={`e = ${keyGenResult.params.e}`} />
                </p>
              </div>

              {/* Step 5: Calculate d using Extended Euclidean Algorithm */}
              <div className="mt-3">
                <p className="font-bold">
                  5. Calculate private exponent <InlineMath math="d" /> using
                  Extended Euclidean Algorithm:
                </p>
                <p className="ml-3">
                  <InlineMath math={`d = e^{-1} \\mod \\phi(n)`} />
                </p>
                <p className="ml-3">
                  <InlineMath
                    math={`q = r_1 \\div r_2, \\; r = r_1 - q \\times r_2, \\; t = t_1 - q \\times t_2`}
                  />
                </p>

                {/* Extended Euclidean Algorithm Steps Table */}
                <div className="mt-2 ml-3">
                  {renderEuclideanStepsTable(keyGenResult.euclideanSteps)}
                </div>

                <div className="mt-2 ml-3">
                  <p>
                    {keyGenResult.params.d >= 0 ? (
                      <InlineMath
                        math={`t_1 > 0 \\Rightarrow d = ${keyGenResult.params.d}`}
                      />
                    ) : (
                      <InlineMath
                        math={`t_1 < 0 \\Rightarrow d = \\phi(n) - |t_1| = ${
                          keyGenResult.params.totient
                        } - (${-keyGenResult.params.d}) = ${
                          keyGenResult.params.d + keyGenResult.params.totient
                        }`}
                      />
                    )}
                  </p>
                </div>
              </div>

              {/* Step 6: Keys */}
              <div className="mt-3">
                <p className="font-bold">6. Key Pair:</p>
                <p className="ml-3">
                  <InlineMath
                    math={`PU = \\{e, n\\} = \\{${keyGenResult.params.e}, ${keyGenResult.params.n}\\}`}
                  />{" "}
                </p>
                <p className="ml-3">
                  <InlineMath
                    math={`PR = \\{d, n\\} = \\{${keyGenResult.params.d}, ${keyGenResult.params.n}\\}`}
                  />{" "}
                </p>
              </div>

              {/* Message input and Security Mode selection */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">RSA Operations</h3>

                {/* Message input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (M)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={keyGenResult ? keyGenResult.params.n - 1 : 0}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={message}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setMessage(value);
                      }
                    }}
                  />
                  {keyGenResult && (
                    <p className="text-xs text-gray-500 mt-1">
                      Message must be between 0 and {keyGenResult.params.n - 1}
                    </p>
                  )}
                </div>

                {/* Security mode selection */}
                <div className="flex items-center mb-4 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={securityMode === "confidentiality"}
                      onChange={() => setSecurityMode("confidentiality")}
                    />
                    <span className="ml-2">Confidentiality</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={securityMode === "authenticity"}
                      onChange={() => setSecurityMode("authenticity")}
                    />
                    <span className="ml-2">Authenticity</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={securityMode === "both"}
                      onChange={() => setSecurityMode("both")}
                    />
                    <span className="ml-2">Both</span>
                  </label>
                </div>

                {/* Calculate and FME buttons */}
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    type="button"
                    className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={performOperations}
                  >
                    Calculate
                  </button>

                  <button
                    type="button"
                    className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowFmeModal(true)}
                  >
                    FME
                  </button>
                </div>

                {/* Step 7: Encryption or Signing */}
                {result.encryption !== null &&
                  securityMode === "confidentiality" && (
                    <div className="mt-6">
                      <h3 className="text-md font-bold">
                        7. Encryption (Confidentiality)
                      </h3>
                      <p>
                        <BlockMath
                          math={`C = M^e \\mod n = ${message}^{${keyGenResult.params.e}} \\mod ${keyGenResult.params.n} = ${result.encryption}`}
                        />
                      </p>

                      {encryptResult && (
                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">
                            Fast Modular Exponentiation
                          </h4>
                          <p className="mb-2">
                            <InlineMath
                              math={`${
                                keyGenResult.params.e
                              }_{10} = ${keyGenResult.params.e.toString(
                                2
                              )}_{2}`}
                            />
                          </p>
                          {renderModExpStepsTable(encryptResult.steps)}
                        </div>
                      )}
                    </div>
                  )}

                {result.signature !== null &&
                  securityMode === "authenticity" && (
                    <div className="mt-6">
                      <h3 className="text-md font-bold">
                        7. Signing (Authenticity)
                      </h3>
                      <p>
                        <BlockMath
                          math={`S = M^d \\mod n = ${message}^{${keyGenResult.params.d}} \\mod ${keyGenResult.params.n} = ${result.signature}`}
                        />
                      </p>

                      {signResult && (
                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">
                            Fast Modular Exponentiation
                          </h4>
                          <p className="mb-2">
                            <InlineMath
                              math={`${
                                keyGenResult.params.d
                              }_{10} = ${keyGenResult.params.d.toString(
                                2
                              )}_{2}`}
                            />
                          </p>
                          {renderModExpStepsTable(signResult.steps)}
                        </div>
                      )}
                    </div>
                  )}

                {result.encryption !== null && securityMode === "both" && (
                  <div className="mt-6">
                    <h3 className="text-md font-bold">
                      7. Encryption (Confidentiality + Authenticity)
                    </h3>
                    <p>
                      <BlockMath
                        math={`\\displaystyle C = \\frac{(M^d \\bmod n)^e}{M^e} \\bmod n = \\frac{(${message}^{${keyGenResult.params.d}} \\bmod ${keyGenResult.params.n})^{${keyGenResult.params.e}}}{${message}^{${keyGenResult.params.e}}} \\bmod ${keyGenResult.params.n} = ${result.encryption}`}
                      />
                    </p>

                    {encryptResult && (
                      <div className="mt-4">
                        <h4 className="text-md font-semibold mb-2">
                          Fast Modular Exponentiation
                        </h4>
                        <p className="mb-2">
                          <InlineMath
                            math={`\\text{First: } S = M^d \\mod n = ${message}^{${keyGenResult.params.d}} \\mod ${keyGenResult.params.n} = ${result.signature}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`\\text{Then: } C = S^e \\mod n = ${result.signature}^{${keyGenResult.params.e}} \\mod ${keyGenResult.params.n} = ${result.encryption}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`${
                              keyGenResult.params.e
                            }_{10} = ${keyGenResult.params.e.toString(2)}_{2}`}
                          />
                        </p>
                        {renderModExpStepsTable(encryptResult.steps)}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 8: Decryption or Verification */}
                {result.decryption !== null &&
                  securityMode === "confidentiality" && (
                    <div className="mt-6">
                      <h3 className="text-md font-bold">
                        8. Decryption (Confidentiality)
                      </h3>
                      <p>
                        <BlockMath
                          math={`P = C^d\\mod n = ${result.encryption}^{${keyGenResult.params.d}} \\mod ${keyGenResult.params.n} = ${result.decryption}`}
                        />
                      </p>

                      {decryptResult && (
                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">
                            Fast Modular Exponentiation
                          </h4>
                          <p className="mb-2">
                            <InlineMath
                              math={`${
                                keyGenResult.params.d
                              }_{10} = ${keyGenResult.params.d.toString(
                                2
                              )}_{2}`}
                            />
                          </p>
                          {renderModExpStepsTable(decryptResult.steps)}
                        </div>
                      )}
                    </div>
                  )}

                {result.verification !== null &&
                  securityMode === "authenticity" && (
                    <div className="mt-6">
                      <h3 className="text-md font-bold">
                        8. Verification (Authenticity)
                      </h3>
                      <p>
                        <BlockMath
                          math={`M' = S^e \\mod n = ${result.signature}^{${keyGenResult.params.e}} \\mod ${keyGenResult.params.n} = ${result.verification}`}
                        />
                      </p>

                      {verifyResult && (
                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">
                            Fast Modular Exponentiation
                          </h4>
                          <p className="mb-2">
                            <InlineMath
                              math={`${
                                keyGenResult.params.e
                              }_{10} = ${keyGenResult.params.e.toString(
                                2
                              )}_{2}`}
                            />
                          </p>
                          {renderModExpStepsTable(verifyResult.steps)}
                        </div>
                      )}
                    </div>
                  )}

                {result.decryption !== null && securityMode === "both" && (
                  <div className="mt-6">
                    <h3 className="text-md font-bold">
                      8. Decryption (Confidentiality + Authenticity)
                    </h3>
                    <p>
                      <BlockMath
                        math={`\\displaystyle P = \\frac{(C^d \\bmod n)^e}{M^e} \\bmod n = \\frac{(${result.encryption}^{${keyGenResult.params.d}} \\bmod ${keyGenResult.params.n})^{${keyGenResult.params.e}}}{${message}^{${keyGenResult.params.e}}} \\bmod ${keyGenResult.params.n} = ${result.decryption}`}
                      />
                    </p>

                    {decryptResult && (
                      <div className="mt-4">
                        <h4 className="text-md font-semibold mb-2">
                          Fast Modular Exponentiation
                        </h4>
                        <p className="mb-2">
                          <InlineMath
                            math={`\\text{First: } M' = C^d \\mod n = ${result.encryption}^{${keyGenResult.params.d}} \\mod ${keyGenResult.params.n} = ${decryptResult.message}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`\\text{Then: } P = M'^e \\mod n = ${decryptResult.message}^{${keyGenResult.params.e}} \\mod ${keyGenResult.params.n} = ${result.decryption}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`${
                              keyGenResult.params.e
                            }_{10} = ${keyGenResult.params.e.toString(2)}_{2}`}
                          />
                        </p>
                        {renderModExpStepsTable(decryptResult.steps)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  // This section has been removed and combined into the main view

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        RSA Encryption
      </h1>

      <div className="py-4">{renderKeyGenerationContent()}</div>

      {/* FME Modal */}
      <Transition appear show={showFmeModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowFmeModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Fast Modular Exponentiation Calculator
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="fme-base"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Base (a)
                      </label>
                      <input
                        id="fme-base"
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={fmeBase}
                        onChange={(e) => setFmeBase(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="fme-exponent"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Exponent (c)
                      </label>
                      <input
                        id="fme-exponent"
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={fmeExponent}
                        onChange={(e) => setFmeExponent(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="fme-modulus"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Modulus (b)
                      </label>
                      <input
                        id="fme-modulus"
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={fmeModulus}
                        onChange={(e) => setFmeModulus(Number(e.target.value))}
                      />
                    </div>

                    {fmeError && (
                      <div className="p-3 bg-red-100 text-red-700 rounded-md">
                        {fmeError}
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={calculateFme}
                      >
                        Calculate
                      </button>

                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={() => setShowFmeModal(false)}
                      >
                        Close
                      </button>
                    </div>

                    {fmeResult && (
                      <div className="mt-4">
                        <h4 className="text-md font-semibold mb-2">Result</h4>
                        <p>
                          <BlockMath
                            math={`${fmeBase}^{${fmeExponent}} \\mod ${fmeModulus} = ${fmeResult.result}`}
                          />
                        </p>

                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">
                            Fast Modular Exponentiation
                          </h4>
                          <p className="mb-2">
                            <InlineMath
                              math={`${fmeExponent}_{10} = ${fmeExponent.toString(
                                2
                              )}_{2}`}
                            />
                          </p>
                          {renderModExpStepsTable(fmeResult.steps)}
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RsaPage;
