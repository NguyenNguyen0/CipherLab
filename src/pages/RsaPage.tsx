import { useState, useEffect } from "react";
import RsaCipher from "../utils/RsaCipher";
import type {
  RsaKeyGenResult,
  RsaOperationResult,
} from "../utils/RsaCipher";
import RsaKeyGeneration from "../components/RsaKeyGeneration";
import FmeModal from "../components/FmeModal";

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

  // Clear operation results
  const clearResults = () => {
    setEncryptResult(null);
    setDecryptResult(null);
    setSignResult(null);
    setVerifyResult(null);
    setResult({
      encryption: null,
      decryption: null,
      signature: null,
      verification: null,
    });
  };

  // Generate RSA keys
  const generateKeys = () => {
    setError(null);
    clearResults();
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
    
    // Validate message size
    if (message > keyGenResult.params.n - 1) {
      setError(`Message must be less than n (${keyGenResult.params.n})`);
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

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        RSA Encryption
      </h1>

      <div className="py-4">
        <RsaKeyGeneration
          p={p}
          q={q}
          e={e}
          possibleE={possibleE}
          message={message}
          securityMode={securityMode}
          keyGenResult={keyGenResult}
          encryptResult={encryptResult}
          decryptResult={decryptResult}
          signResult={signResult}
          verifyResult={verifyResult}
          result={result}
          error={error}
          onPChange={setP}
          onQChange={setQ}
          onEChange={setE}
          onMessageChange={setMessage}
          onSecurityModeChange={setSecurityMode}
          onGenerateKeys={generateKeys}
          onPerformOperations={performOperations}
          onShowFmeModal={() => setShowFmeModal(true)}
        />
      </div>

      <FmeModal
        isOpen={showFmeModal}
        onClose={() => setShowFmeModal(false)}
      />
    </div>
  );
};

export default RsaPage;
