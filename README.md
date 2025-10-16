# CipherLab 🤖

A compact collection of classic ciphers plus a tiny RSA demo for learning and quick experiments.

Highlights
- 🔐 RSA: key generation, encrypt/decrypt, fast modular exponentiation
- 🔁 Caesar cipher (shift-based)
- 🪵 Rail Fence (fence) cipher
- 🔍 Playfair cipher (5×5 digraph table)
- 🧩 Small React demo UI and a reusable cipher library

Quick start (Windows)
1. Open a terminal in the project folder.
2. Install dependencies:
   npm install
3. Run the demo:
   npm start
4. Run tests:
   npm test

Library usage
- Import the functions you need from the library.
- Each cipher typically provides:
  - setup / key generation functions (when applicable)
  - encrypt(plaintext, options)
  - decrypt(ciphertext, options)

Examples (summary)
- RSA: generate p, q → n = p·q; pick e with gcd(e, φ(n)) = 1; compute d = e^-1 mod φ(n); Encrypt: C = M^e mod n; Decrypt: M = C^d mod n.
- Caesar: shift characters by n positions.
- Rail Fence: write text across rails, read row-wise.
- Playfair: build 5×5 key table and encrypt digraphs.

Notes on RSA
- Use the extended Euclidean algorithm to compute modular inverses.
- Use fast modular exponentiation for secure/efficient pow-mod operations.
- This project is for learning and demo purposes only — do not use for production security.

Contributing
- Open issues or PRs.
- Keep changes small and include tests for cipher behavior.
- Prefer clear examples and comments for educational value.

License & safety
- Educational demo only. Review cryptographic choices before reuse in real systems.

Happy experimenting 🤖

