import { InlineMath, BlockMath } from "react-katex";
import RsaCipher from "../utils/RsaCipher";
import type { RsaKeyGenResult, RsaOperationResult } from "../utils/RsaCipher";
import EuclideanStepsTable from "./EuclideanStepsTable";
import ModExpStepsTable from "./ModExpStepsTable";

interface RsaKeyGenerationProps {
  p: number;
  q: number;
  e: number;
  possibleE: number[];
  message: number;
  securityMode: "confidentiality" | "authenticity" | "both";
  keyGenResult: RsaKeyGenResult | null;
  encryptResult: RsaOperationResult | null;
  decryptResult: RsaOperationResult | null;
  signResult: RsaOperationResult | null;
  verifyResult: RsaOperationResult | null;
  result: {
    encryption: number | null;
    decryption: number | null;
    signature: number | null;
    verification: number | null;
  };
  error: string | null;
  onPChange: (value: number) => void;
  onQChange: (value: number) => void;
  onEChange: (value: number) => void;
  onMessageChange: (value: number) => void;
  onSecurityModeChange: (mode: "confidentiality" | "authenticity" | "both") => void;
  onGenerateKeys: () => void;
  onPerformOperations: () => void;
  onShowFmeModal: () => void;
}

const RsaKeyGeneration = ({
  p,
  q,
  e,
  possibleE,
  message,
  securityMode,
  keyGenResult,
  encryptResult,
  decryptResult,
  signResult,
  verifyResult,
  result,
  error,
  onPChange,
  onQChange,
  onEChange,
  onMessageChange,
  onSecurityModeChange,
  onGenerateKeys,
  onPerformOperations,
  onShowFmeModal,
}: RsaKeyGenerationProps) => {
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
            value={p === 0 ? "" : p}
            id="p-input"
            onChange={(e) => {
              const value =
                e.target.value === "" ? 0 : parseInt(e.target.value);
              if (!isNaN(value)) {
                onPChange(value);
              }
            }}
          />
          {p !== 0 && !RsaCipher.isPrime(p) && (
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
            value={q === 0 ? "" : q}
            id="q-input"
            onChange={(e) => {
              const value =
                e.target.value === "" ? 0 : parseInt(e.target.value);
              if (!isNaN(value)) {
                onQChange(value);
              }
            }}
          />
          {q !== 0 && !RsaCipher.isPrime(q) && (
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
          onChange={(e) => onEChange(parseInt(e.target.value))}
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
          onClick={onGenerateKeys}
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
                <EuclideanStepsTable steps={keyGenResult.euclideanSteps} />
              </div>

              <div className="mt-2 ml-3">
                <p>
                  {keyGenResult.euclideanSteps.length > 0 &&
                  keyGenResult.euclideanSteps[
                    keyGenResult.euclideanSteps.length - 1
                  ].t2 >= 0 ? (
                    <InlineMath
                      math={`t_1 > 0 \\Rightarrow d = ${keyGenResult.params.d}`}
                    />
                  ) : (
                    <InlineMath
                      math={`t_1 < 0 \\Rightarrow d = \\phi(n) + |t_1| = ${
                        keyGenResult.params.totient
                      } + (${
                        keyGenResult.euclideanSteps[
                          keyGenResult.euclideanSteps.length - 1
                        ].t2
                      }) = ${
                        keyGenResult.euclideanSteps[
                          keyGenResult.euclideanSteps.length - 1
                        ].t2 + keyGenResult.params.totient
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
                  value={message === 0 ? "" : message}
                  id="message-input"
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      onMessageChange(value);
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
                    onChange={() => onSecurityModeChange("confidentiality")}
                  />
                  <span className="ml-2">Confidentiality</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={securityMode === "authenticity"}
                    onChange={() => onSecurityModeChange("authenticity")}
                  />
                  <span className="ml-2">Authenticity</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={securityMode === "both"}
                    onChange={() => onSecurityModeChange("both")}
                  />
                  <span className="ml-2">Both</span>
                </label>
              </div>

              {/* Calculate and FME buttons */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={onPerformOperations}
                >
                  Calculate
                </button>

                <button
                  type="button"
                  className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onShowFmeModal}
                >
                  FME
                </button>
              </div>

              {/* Message validation error message */}
              {error && (
                <div className="mt-4 text-red-500 text-center">{error}</div>
              )}

              {/* Step 7: Encryption or Signing */}
              {result.encryption !== null &&
                encryptResult !== null &&
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
                        <p className="font-mono mb-2">
                          <InlineMath
                            math={`${message}^{${keyGenResult.params.e}} \\mod ${keyGenResult.params.n}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`${
                              keyGenResult.params.e
                            }_{10} = ${keyGenResult.params.e.toString(
                              2
                            )}_{2}`}
                          />
                        </p>
                        <ModExpStepsTable steps={encryptResult.steps} />
                      </div>
                    )}
                  </div>
                )}

              {result.signature !== null &&
                signResult !== null &&
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
                            math={`${message}^{${keyGenResult.params.d}} \\mod ${keyGenResult.params.n}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`${
                              keyGenResult.params.d
                            }_{10} = ${keyGenResult.params.d.toString(
                              2
                            )}_{2}`}
                          />
                        </p>
                        <ModExpStepsTable steps={signResult.steps} />
                      </div>
                    )}
                  </div>
                )}

              {result.encryption !== null &&
                encryptResult !== null &&
                securityMode === "both" && (
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
                            }_{10} = ${keyGenResult.params.e.toString(
                              2
                            )}_{2}`}
                          />
                        </p>
                        <ModExpStepsTable steps={encryptResult.steps} />
                      </div>
                    )}
                  </div>
                )}

              {/* Step 8: Decryption or Verification */}
              {result.decryption !== null &&
                decryptResult !== null &&
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
                            math={`${result.encryption}^{${keyGenResult.params.d}} \\mod ${keyGenResult.params.n}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`${
                              keyGenResult.params.d
                            }_{10} = ${keyGenResult.params.d.toString(
                              2
                            )}_{2}`}
                          />
                        </p>
                        <ModExpStepsTable steps={decryptResult.steps} />
                      </div>
                    )}
                  </div>
                )}

              {result.verification !== null &&
                verifyResult !== null &&
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
                            math={`${result.signature}^{${keyGenResult.params.e}} \\mod ${keyGenResult.params.n}`}
                          />
                        </p>
                        <p className="mb-2">
                          <InlineMath
                            math={`${
                              keyGenResult.params.e
                            }_{10} = ${keyGenResult.params.e.toString(
                              2
                            )}_{2}`}
                          />
                        </p>
                        <ModExpStepsTable steps={verifyResult.steps} />
                      </div>
                    )}
                  </div>
                )}

              {result.decryption !== null &&
                decryptResult !== null &&
                securityMode === "both" && (
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
                            }_{10} = ${keyGenResult.params.e.toString(
                              2
                            )}_{2}`}
                          />
                        </p>
                        <ModExpStepsTable steps={decryptResult.steps} />
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

export default RsaKeyGeneration;