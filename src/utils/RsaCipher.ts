/**
 * RSA Cipher Utility
 * Provides functions for RSA key generation, encryption, decryption, and step-by-step solving
 */

// Interface for RSA keys
export interface RsaKeyPair {
  publicKey: {
    e: number; // Public exponent
    n: number; // Modulus (n = p * q)
  };
  privateKey: {
    d: number; // Private exponent
    n: number; // Modulus (n = p * q)
  };
}

// Interface for RSA parameters
export interface RsaParams {
  p: number;        // First prime
  q: number;        // Second prime
  n: number;        // Modulus (n = p * q)
  totient: number;  // Euler's totient function φ(n) = (p-1) * (q-1)
  e: number;        // Public exponent
  d: number;        // Private exponent
}

// Interface for extended Euclidean algorithm steps
export interface EuclideanStep {
  q: number;        // Quotient
  r1: number;       // First remainder
  r2: number;       // Second remainder
  r: number;        // New remainder
  t1: number;       // First coefficient
  t2: number;       // Second coefficient
  t: number;        // New coefficient
}

// Interface for modular exponentiation steps
export interface ModExpStep {
  i: number;        // Bit position
  bit: number;      // Bit value (0 or 1)
  p: number;        // Power value before squaring
  pSquared: number; // p^2
  pMod: number;     // p^2 mod n
  z?: number;       // Optional multiplication value if bit is 1
  result: number;   // Current result after this step
}

// Interface for RSA operation result with steps
export interface RsaOperationResult {
  message: number;  // Original message or ciphertext
  result: number;   // Result after operation
  steps: ModExpStep[]; // Steps of the calculation
}

// Interface for key generation result with steps
export interface RsaKeyGenResult {
  params: RsaParams;
  keyPair: RsaKeyPair;
  euclideanSteps: EuclideanStep[];
}

class RsaCipher {
  /**
   * Check if a number is prime
   * @param num Number to check
   * @returns True if prime, false otherwise
   */
  static isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    
    return true;
  }

  /**
   * Calculate greatest common divisor (GCD)
   * @param a First number
   * @param b Second number
   * @returns GCD of a and b
   */
  static gcd(a: number, b: number): number {
    if (b === 0) return a;
    return this.gcd(b, a % b);
  }

  /**
   * Generate RSA key pair with step-by-step calculation
   * @param p First prime number
   * @param q Second prime number
   * @param e Public exponent (optional)
   * @returns RSA parameters, key pair, and calculation steps
   */
  static generateKeyPair(p: number, q: number, e?: number): RsaKeyGenResult {
    // Validate inputs
    if (!this.isPrime(p)) {
      throw new Error("P must be a prime number");
    }
    
    if (!this.isPrime(q)) {
      throw new Error("Q must be a prime number");
    }
    
    if (p === q) {
      throw new Error("P and Q must be different prime numbers");
    }
    
    const n = p * q;
    const totient = (p - 1) * (q - 1);
    
    // Find valid e if not provided
    if (!e) {
      for (let i = 3; i < totient; i += 2) {
        if (this.gcd(i, totient) === 1) {
          e = i;
          break;
        }
      }
    } else if (this.gcd(e, totient) !== 1) {
      throw new Error(`The selected e=${e} is not coprime with φ(n)=${totient}`);
    }
    
    if (!e) {
      throw new Error("Could not find a valid public exponent e");
    }
    
    // Calculate private key using extended Euclidean algorithm with steps
    const { d, steps } = this.modInverseWithSteps(e, totient);
    
    return {
      params: { p, q, n, totient, e, d },
      keyPair: {
        publicKey: { e, n },
        privateKey: { d, n }
      },
      euclideanSteps: steps
    };
  }

  /**
   * Calculate modular inverse using extended Euclidean algorithm with step tracking
   * @param e Number to find inverse for
   * @param m Modulus
   * @returns Modular inverse and calculation steps
   */
  static modInverseWithSteps(e: number, m: number): { d: number, steps: EuclideanStep[] } {
    if (m === 1) return { d: 0, steps: [] };
    
    let r1 = m;
    let r2 = e;
    let t1 = 0;
    let t2 = 1;
    const steps: EuclideanStep[] = [];
    
    while (r2 > 0) {
      const q = Math.floor(r1 / r2);
      const r = r1 - q * r2;
      const t = t1 - q * t2;
      
      steps.push({ q, r1, r2, r, t1, t2, t });
      
      r1 = r2;
      r2 = r;
      t1 = t2;
      t2 = t;
    }
    
    // Make sure t1 is positive
    if (t1 < 0) {
      t1 += m;
    }
    
    return { d: t1, steps };
  }

  /**
   * Fast modular exponentiation with step tracking
   * @param base Base number
   * @param exponent Exponent
   * @param modulus Modulus
   * @returns Result and calculation steps
   */
  static modExpWithSteps(base: number, exponent: number, modulus: number): { result: number, steps: ModExpStep[] } {
    if (modulus === 1) return { result: 0, steps: [] };
    
    // Convert exponent to binary
    const binaryExp = exponent.toString(2).split('').map(Number);
    
    let result = 1;
    let p = base % modulus;
    const steps: ModExpStep[] = [];
    
    for (let i = 0; i < binaryExp.length; i++) {
      const bit = binaryExp[i];
      const currentP = p;
      const pSquared = (p * p);
      const pMod = pSquared % modulus;
      
      const step: ModExpStep = {
        i: binaryExp.length - i - 1,  // Bit position from right to left
        bit,
        p: currentP,
        pSquared,
        pMod,
        result: result
      };
      
      if (bit === 1) {
        const prevResult = result;
        result = (result * p) % modulus;
        step.z = prevResult * p;
        step.result = result;
      }
      
      steps.push(step);
      p = pMod;
    }
    
    return { result, steps };
  }

  /**
   * Encrypt a message using RSA (confidentiality)
   * @param message Message to encrypt (as a number)
   * @param publicKey Public key { e, n }
   * @returns Encrypted message and calculation steps
   */
  static encrypt(message: number, publicKey: { e: number, n: number }): RsaOperationResult {
    const { e, n } = publicKey;
    
    if (message < 0 || message >= n) {
      throw new Error(`Message must be between 0 and ${n-1}`);
    }
    
    const { result, steps } = this.modExpWithSteps(message, e, n);
    
    return {
      message,
      result,
      steps
    };
  }

  /**
   * Decrypt a ciphertext using RSA (confidentiality)
   * @param ciphertext Ciphertext to decrypt (as a number)
   * @param privateKey Private key { d, n }
   * @returns Decrypted message and calculation steps
   */
  static decrypt(ciphertext: number, privateKey: { d: number, n: number }): RsaOperationResult {
    const { d, n } = privateKey;
    
    if (ciphertext < 0 || ciphertext >= n) {
      throw new Error(`Ciphertext must be between 0 and ${n-1}`);
    }
    
    const { result, steps } = this.modExpWithSteps(ciphertext, d, n);
    
    return {
      message: ciphertext,
      result,
      steps
    };
  }

  /**
   * Sign a message using RSA (authenticity)
   * @param message Message to sign (as a number)
   * @param privateKey Private key { d, n }
   * @returns Signed message and calculation steps
   */
  static sign(message: number, privateKey: { d: number, n: number }): RsaOperationResult {
    const { d, n } = privateKey;
    
    if (message < 0 || message >= n) {
      throw new Error(`Message must be between 0 and ${n-1}`);
    }
    
    const { result, steps } = this.modExpWithSteps(message, d, n);
    
    return {
      message,
      result,
      steps
    };
  }

  /**
   * Verify a signature using RSA (authenticity)
   * @param signature Signature to verify (as a number)
   * @param publicKey Public key { e, n }
   * @returns Original message and calculation steps
   */
  static verify(signature: number, publicKey: { e: number, n: number }): RsaOperationResult {
    const { e, n } = publicKey;
    
    if (signature < 0 || signature >= n) {
      throw new Error(`Signature must be between 0 and ${n-1}`);
    }
    
    const { result, steps } = this.modExpWithSteps(signature, e, n);
    
    return {
      message: signature,
      result,
      steps
    };
  }

  /**
   * Get a list of valid public exponents for given p and q
   * @param p First prime number
   * @param q Second prime number
   * @param limit Maximum number of values to return
   * @returns Array of valid e values
   */
  static getValidPublicExponents(p: number, q: number, limit: number = 10): number[] {
    if (!this.isPrime(p) || !this.isPrime(q)) {
      return [];
    }
    
    const totient = (p - 1) * (q - 1);
    const validE: number[] = [];
    
    for (let i = 2; i < totient; i++) {
      if (this.gcd(i, totient) === 1) {
        validE.push(i);
        if (validE.length >= limit) break;
      }
    }
    
    return validE;
  }
  
  /**
   * Encrypt a message using RSA with both confidentiality and authenticity
   * C = (M^d mod n)^e mod n = (signature)^e mod n
   * @param message Message to encrypt (as a number)
   * @param privateKey Private key { d, n } for signing
   * @param publicKey Public key { e, n } for encryption
   * @returns Encrypted message and calculation steps
   */
  static encryptWithBoth(message: number, privateKey: { d: number, n: number }, publicKey: { e: number, n: number }): RsaOperationResult {
    const { n: privateN } = privateKey;
    const { e, n: publicN } = publicKey;
    
    if (message < 0 || message >= privateN) {
      throw new Error(`Message must be between 0 and ${privateN-1}`);
    }
    
    // First sign the message: S = M^d mod n
    const signResult = this.sign(message, privateKey);
    
    // Then encrypt the signature: C = S^e mod n
    const { result, steps } = this.modExpWithSteps(signResult.result, e, publicN);
    
    return {
      message,
      result,
      steps
    };
  }
  
  /**
   * Decrypt a message using RSA with both confidentiality and authenticity
   * P = (C^d mod n)^e mod n = (decryption)^e mod n
   * @param ciphertext Ciphertext to decrypt (as a number)
   * @param privateKey Private key { d, n } for decryption
   * @param publicKey Public key { e, n } for verification
   * @returns Decrypted message and calculation steps
   */
  static decryptWithBoth(ciphertext: number, privateKey: { d: number, n: number }, publicKey: { e: number, n: number }): RsaOperationResult {
    const { n: privateN } = privateKey;
    const { e, n: publicN } = publicKey;
    
    if (ciphertext < 0 || ciphertext >= privateN) {
      throw new Error(`Ciphertext must be between 0 and ${privateN-1}`);
    }
    
    // First decrypt the ciphertext: M' = C^d mod n
    const decryptResult = this.decrypt(ciphertext, privateKey);
    
    // Then verify the decryption: P = M'^e mod n
    const { result, steps } = this.modExpWithSteps(decryptResult.result, e, publicN);
    
    return {
      message: decryptResult.result, // Store the intermediate result for display
      result,
      steps
    };
  }
}

export default RsaCipher;