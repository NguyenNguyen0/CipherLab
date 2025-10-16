/**
 * Playfair Cipher Implementation
 */

export interface PlayfairParams {
  key: string;
  plaintext: string;
  separateChar: string;
  insertCharAtLast: boolean;
}

export interface PlayfairResult {
  ciphertext: string;
  matrix: string[][];
  processedPlaintext: string;
  digraphs: { plaintext: string; ciphertext: string }[];
}

export class PlayfairCipher {
  /**
   * Generate a 5x5 matrix from the key for Playfair cipher
   * I and J share the same position in the matrix
   */
  static generateMatrix(key: string): string[][] {
    // Normalize the key by removing spaces, making lowercase, and replacing J with I
    const normalizedKey = key
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/j/g, 'i');

    // Start with key letters without repeats
    const uniqueChars = [...new Set(normalizedKey.split(''))];
    
    // Add remaining alphabet (excluding J)
    const alphabet = 'abcdefghiklmnopqrstuvwxyz'; // no j
    for (const char of alphabet) {
      if (!uniqueChars.includes(char)) {
        uniqueChars.push(char);
      }
    }
    
    // Create 5x5 matrix
    const matrix: string[][] = [];
    for (let i = 0; i < 5; i++) {
      matrix.push(uniqueChars.slice(i * 5, i * 5 + 5));
    }
    
    return matrix;
  }
  
  /**
   * Find the position of a letter in the matrix
   */
  static findPosition(matrix: string[][], letter: string): [number, number] {
    // Normalize input (convert j to i)
    const normalizedLetter = letter.toLowerCase() === 'j' ? 'i' : letter.toLowerCase();
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (matrix[row][col] === normalizedLetter) {
          return [row, col];
        }
      }
    }
    
    // This should never happen with valid input
    throw new Error(`Letter ${letter} not found in matrix`);
  }
  
  /**
   * Process plaintext for Playfair cipher
   * - Convert to lowercase
   * - Remove non-alphabetic characters
   * - Replace J with I
   * - Split into digraphs
   * - Handle repeated letters by inserting separator
   * - Add final separator if odd length and insertCharAtLast is true
   */
  static processPlaintext(plaintext: string, separateChar: string, insertCharAtLast: boolean): string {
    // Normalize plaintext
    const processed = plaintext
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/j/g, 'i');
    
    // Insert separator between repeated letters
    let result = '';
    for (let i = 0; i < processed.length; i++) {
      result += processed[i];
      // If this is not the last character and the next character is the same, insert separator
      if (i < processed.length - 1 && processed[i] === processed[i + 1]) {
        result += separateChar;
      }
    }
    
    // Add separator at the end if odd length and insertCharAtLast is true
    if (result.length % 2 !== 0 && insertCharAtLast) {
      result += separateChar;
    }
    
    return result;
  }
  
  /**
   * Split text into digraphs (pairs of letters)
   */
  static getDigraphs(text: string): string[] {
    const digraphs: string[] = [];
    for (let i = 0; i < text.length; i += 2) {
      if (i + 1 < text.length) {
        digraphs.push(text.substring(i, i + 2));
      } else {
        // Should not happen with properly processed plaintext
        digraphs.push(text.substring(i, i + 1));
      }
    }
    return digraphs;
  }
  
  /**
   * Encrypt a digraph according to the Playfair rules
   */
  static encryptDigraph(matrix: string[][], digraph: string): string {
    const [row1, col1] = this.findPosition(matrix, digraph[0]);
    const [row2, col2] = this.findPosition(matrix, digraph[1]);
    
    let newRow1 = row1;
    let newCol1 = col1;
    let newRow2 = row2;
    let newCol2 = col2;
    
    // Same row: shift right (wrapping)
    if (row1 === row2) {
      newCol1 = (col1 + 1) % 5;
      newCol2 = (col2 + 1) % 5;
    } 
    // Same column: shift down (wrapping)
    else if (col1 === col2) {
      newRow1 = (row1 + 1) % 5;
      newRow2 = (row2 + 1) % 5;
    } 
    // Rectangle: swap columns
    else {
      newCol1 = col2;
      newCol2 = col1;
    }
    
    return matrix[newRow1][newCol1] + matrix[newRow2][newCol2];
  }
  
  /**
   * Encrypt plaintext using Playfair cipher
   */
  static encrypt(params: PlayfairParams): PlayfairResult {
    const { key, plaintext, separateChar, insertCharAtLast } = params;
    
    // Generate matrix
    const matrix = this.generateMatrix(key);
    
    // Process plaintext
    const processedPlaintext = this.processPlaintext(plaintext, separateChar, insertCharAtLast);
    
    // Split into digraphs
    const plaintextDigraphs = this.getDigraphs(processedPlaintext);
    
    // Encrypt each digraph
    const encryptedDigraphs: { plaintext: string; ciphertext: string }[] = [];
    const encryptedParts: string[] = [];
    
    for (const digraph of plaintextDigraphs) {
      const encryptedDigraph = this.encryptDigraph(matrix, digraph);
      encryptedParts.push(encryptedDigraph);
      encryptedDigraphs.push({
        plaintext: digraph,
        ciphertext: encryptedDigraph
      });
    }
    
    const ciphertext = encryptedParts.join('');
    
    return {
      ciphertext,
      matrix,
      processedPlaintext,
      digraphs: encryptedDigraphs
    };
  }
}

export default PlayfairCipher;