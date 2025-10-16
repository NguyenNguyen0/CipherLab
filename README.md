# CipherLab 🔐

## Introduction

CipherLab is an educational cryptography toolkit built with React and TypeScript that implements four classic cipher algorithms. This project serves as both a learning resource for understanding fundamental cryptographic concepts and a practical tool for experimenting with different encryption methods.

The application features an intuitive web interface that visualizes the encryption and decryption processes, making it easier to understand how each algorithm transforms plaintext into ciphertext and vice versa. Whether you're a student learning about cryptography, a teacher looking for educational materials, or simply a security enthusiast, CipherLab offers a hands-on approach to exploring classic encryption techniques.

## Features

- � **Educational focus**: Clear visualizations of encryption/decryption steps
- 🛠️ **Multiple cipher implementations**: Caesar, Playfair, Rail Fence, and RSA
- 🔄 **Real-time encryption/decryption**: See results instantly as you type
- 📱 **Responsive design**: Works on both desktop and mobile devices
- 🧩 **Modular architecture**: Reusable cipher components for your own projects

## Installation

### Prerequisites
- Node.js (v14.0 or higher)
- npm (v6.0 or higher) or yarn

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NguyenNguyen0/encoder.git
   cd encoder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser:**
   The application will be available at [http://localhost:3000](http://localhost:3000)

5. **Run tests (optional):**
   ```bash
   npm test
   # or
   yarn test
   ```

## Cipher Algorithms

### 1. Caesar Cipher

The Caesar cipher is one of the simplest and most widely known encryption techniques. Named after Julius Caesar, who reportedly used it to communicate with his generals.

**How it works:**
- Each letter in the plaintext is shifted a certain number of places down or up the alphabet
- The shift amount is determined by the key value (e.g., key=3 means A→D, B→E, etc.)
- Non-alphabetic characters typically remain unchanged

**Implementation:**
- Supports custom shift values (key)
- Handles both uppercase and lowercase letters
- Preserves non-alphabetic characters
- Supports wrap-around (Z with shift 1 becomes A)

### 2. Playfair Cipher

The Playfair cipher uses a 5×5 grid of letters based on a keyword, encrypting pairs of letters (digraphs) instead of single letters.

**How it works:**
- A 5×5 key table is created using a keyword (typically excluding 'J' or combining 'I' and 'J')
- Plaintext is divided into pairs of letters (digraphs)
- Special rules apply when encrypting each pair:
  - If letters are in the same row, use letters to their right (wrapping if needed)
  - If letters are in the same column, use letters below them (wrapping if needed)
  - If letters form a rectangle, use the letters at the other corners of the rectangle

**Implementation:**
- Custom key table generation from keyword
- Handles special cases (repeated letters in pairs, odd-length messages)
- Visualizes the key table and encryption process

### 3. Rail Fence Cipher

The Rail Fence cipher (also called a zigzag cipher) is a form of transposition cipher that derives its name from the way the message is encoded.

**How it works:**
- The plaintext is written in a zigzag pattern across a specified number of rails (rows)
- The ciphertext is then read off row by row
- Multiple transpositions can be applied for increased security

**Implementation:**
- Customizable key (rail count) and transposition times
- Visual representation of the zigzag pattern
- Shows intermediate results for multiple transpositions
- Handles keys with duplicate characters

### 4. RSA Encryption

RSA (Rivest–Shamir–Adleman) is an asymmetric cryptographic algorithm based on the practical difficulty of factoring the product of two large prime numbers.

**How it works:**
- Key generation:
  - Choose two distinct prime numbers p and q
  - Compute n = p × q
  - Calculate φ(n) = (p-1) × (q-1)
  - Choose an integer e such that 1 < e < φ(n) and gcd(e, φ(n)) = 1
  - Determine d such that (d × e) mod φ(n) = 1
- Encryption: c = m^e mod n (where m is the message)
- Decryption: m = c^d mod n (where c is the ciphertext)

**Implementation:**
- Guided key generation process
- Fast modular exponentiation for efficient operations
- Supports both text and numerical input
- Educational visualization of the encryption/decryption process

## Using the Cipher Library

Each cipher is implemented as a reusable class in the `src/utils/` directory. You can import these classes to use in your own projects:

```typescript
// Example usage of Caesar Cipher
import { CaesarCipher } from './utils/CaesarCipher';

// Encrypt with a shift of 3
const encrypted = CaesarCipher.encrypt('Hello World', 3);
console.log(encrypted); // "Khoor Zruog"

// Decrypt
const decrypted = CaesarCipher.decrypt(encrypted, 3);
console.log(decrypted); // "Hello World"
```

## Security Notice

⚠️ **Important**: This project is designed for educational purposes only. The implementations focus on clarity and visualization rather than security. Do not use these cipher implementations for securing sensitive data in production environments.

- The RSA implementation uses small key sizes for educational demonstration
- No padding schemes or other modern security measures are implemented
- Classic ciphers (Caesar, Playfair, Rail Fence) are not cryptographically secure

## Contributing

Contributions are welcome! If you'd like to improve CipherLab:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add appropriate tests
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please focus on educational value and code clarity in your contributions.

Happy exploring cryptography! 🔐�
