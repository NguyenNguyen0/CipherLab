// Rail Fence Cipher implementation
export class RailFenceCipher {
  /**
   * Encrypts a plaintext using the Rail Fence cipher
   * @param plaintext - The text to encrypt
   * @param key - The key (must be a string)
   * @param transpositionTimes - Number of times to repeat the transposition
   * @returns An object containing the encrypted text and intermediate steps for visualization
   */
  static encrypt(
    plaintext: string,
    key: string,
    transpositionTimes: number
  ): {
    ciphertext: string;
    steps: Array<{
      columnMap: Record<string, string[]>;
      keyOrder: Array<{ char: string; index: number; displayChar: string }>;
      tableData: string[][];
      tableHeaders: Array<{ char: string; displayChar: string; order: number }>;
      intermediateText: string;
    }>;
  } {
    // Remove spaces from plaintext
    plaintext = plaintext.replace(/\s+/g, "");
    let currentText = plaintext;
    const steps = [];

    for (let t = 0; t < transpositionTimes; t++) {
      // Step 1: Create columns for each key character, handling duplicates
      const columnMap: Record<string, string[]> = {};
      
      // Generate unique keys for each position, preserving original display char
      const keyData: { mapKey: string; displayChar: string; index: number }[] = [];
      const charCount: Record<string, number> = {};
      
      [...key].forEach((char, idx) => {
        if (!charCount[char]) {
          charCount[char] = 0;
        }
        
        const count = charCount[char];
        charCount[char]++;
        
        // Use char+count as the unique map key, but display only the character
        const mapKey = count > 0 ? `${char}${count}` : char;
        keyData.push({ mapKey, displayChar: char, index: idx });
        
        // Initialize the column
        columnMap[mapKey] = [];
      });

      // Step 2: Insert plaintext from left to right into columns
      for (let i = 0; i < currentText.length; i++) {
        const columnIndex = i % keyData.length;
        const mapKey = keyData[columnIndex].mapKey;
        const rowIndex = Math.floor(i / keyData.length);
        
        // Ensure the column has enough rows
        while (columnMap[mapKey].length <= rowIndex) {
          columnMap[mapKey].push("");
        }
        
        columnMap[mapKey][rowIndex] = currentText[i];
      }
      
      // Step 3: Calculate alphabetical order for each key character
      const alphabeticOrder = [...keyData]
        .sort((a, b) => {
          // First sort by the display character
          if (a.displayChar < b.displayChar) return -1;
          if (a.displayChar > b.displayChar) return 1;
          
          // If the same character, use the original index for stable sorting
          return a.index - b.index;
        })
        .map((item, orderIndex) => ({
          ...item,
          order: orderIndex + 1
        }));
      
      // Create table headers with order numbers for display
      const tableHeaders = keyData.map(({ mapKey, displayChar, index }) => {
        const orderInfo = alphabeticOrder.find(
          item => item.mapKey === mapKey && item.index === index
        );
        return {
          char: mapKey,
          displayChar: displayChar,
          order: orderInfo ? orderInfo.order : 0
        };
      });
      
      // Create table data for visualization
      const maxRows = Math.max(...Object.values(columnMap).map(col => col.length), 0);
      const tableData: string[][] = [];
      
      for (let row = 0; row < maxRows; row++) {
        const tableRow: string[] = [];
        for (const { mapKey } of keyData) {
          tableRow.push(columnMap[mapKey][row] || "");
        }
        tableData.push(tableRow);
      }

      // Step 4: Sort columns alphabetically and join to create ciphertext
      let sortedText = "";
      alphabeticOrder.forEach(({ mapKey }) => {
        sortedText += columnMap[mapKey].join("");
      });
      
      currentText = sortedText;

      // Store steps for visualization
      steps.push({
        columnMap,
        keyOrder: alphabeticOrder.map(({ mapKey, displayChar, index }) => ({
          char: mapKey,
          displayChar,
          index
        })),
        tableData,
        tableHeaders,
        intermediateText: currentText
      });
    }

    return {
      ciphertext: currentText,
      steps
    };
  }

  /**
   * Decrypts a ciphertext using the Rail Fence cipher
   * @param ciphertext - The text to decrypt
   * @param key - The key (must be a string)
   * @param transpositionTimes - Number of times the transposition was applied
   * @returns The decrypted text
   */
  static decrypt(
    ciphertext: string,
    key: string,
    transpositionTimes: number
  ): string {
    // Remove spaces from ciphertext
    ciphertext = ciphertext.replace(/\s+/g, "");
    let currentText = ciphertext;
    
    for (let t = 0; t < transpositionTimes; t++) {
      // Step 1: Process the key, preserving duplicates
      const keyData: { mapKey: string; displayChar: string; index: number }[] = [];
      const charCount: Record<string, number> = {};
      
      [...key].forEach((char, idx) => {
        if (!charCount[char]) {
          charCount[char] = 0;
        }
        
        const count = charCount[char];
        charCount[char]++;
        
        // Use char+count as the unique map key, but display only the character
        const mapKey = count > 0 ? `${char}${count}` : char;
        keyData.push({ mapKey, displayChar: char, index: idx });
      });
      
      // Step 2: Sort key characters alphabetically
      const alphabeticOrder = [...keyData]
        .sort((a, b) => {
          if (a.displayChar < b.displayChar) return -1;
          if (a.displayChar > b.displayChar) return 1;
          return a.index - b.index;
        });
      
      // Step 3: Calculate column lengths
      const numCols = keyData.length;
      const totalChars = currentText.length;
      const charsPerCol = Math.floor(totalChars / numCols);
      const extraChars = totalChars % numCols;
      
      const colLengths: Record<string, number> = {};
      alphabeticOrder.forEach((item, idx) => {
        colLengths[item.mapKey] = charsPerCol + (idx < extraChars ? 1 : 0);
      });
      
      // Step 4: Fill columns from ciphertext
      const columns: Record<string, string[]> = {};
      let currentIndex = 0;
      
      for (const { mapKey } of alphabeticOrder) {
        columns[mapKey] = [];
        const colLength = colLengths[mapKey];
        
        for (let i = 0; i < colLength; i++) {
          if (currentIndex < currentText.length) {
            columns[mapKey].push(currentText[currentIndex++]);
          }
        }
      }
      
      // Step 5: Read across rows to reconstruct original text
      let plaintext = "";
      const maxRows = Math.max(...Object.values(columns).map(col => col.length), 0);
      
      for (let row = 0; row < maxRows; row++) {
        for (const { mapKey } of keyData) {
          if (row < columns[mapKey].length) {
            plaintext += columns[mapKey][row];
          }
        }
      }
      
      currentText = plaintext;
    }
    
    return currentText;
  }
}