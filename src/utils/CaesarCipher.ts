type StepResult = {
  plaintext: string;
  numericValue: number;
  computation: string;
  result: number;
  resultChar: string;
};

class CaesarCipher {
  private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly ALPHABET_SIZE = 26;
  
  private static readonly VN_ALPHABET = 'AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUVƯXY';
  private static readonly VN_ALPHABET_SIZE = 29;
  
  // Remove Vietnamese diacritics from a string
  private static removeDiacritics(str: string): string {
    const map: Record<string, string> = {
      // a
      á: "a", à: "a", ả: "a", ã: "a", ạ: "a",
      Á: "A", À: "A", Ả: "A", Ã: "A", Ạ: "A",
  
      // ă
      ắ: "ă", ằ: "ă", ẳ: "ă", ẵ: "ă", ặ: "ă",
      Ắ: "Ă", Ằ: "Ă", Ẳ: "Ă", Ẵ: "Ă", Ặ: "Ă",
  
      // â
      ấ: "â", ầ: "â", ẩ: "â", ẫ: "â", ậ: "â",
      Ấ: "Â", Ầ: "Â", Ẩ: "Â", Ẫ: "Â", Ậ: "Â",
  
      // e
      é: "e", è: "e", ẻ: "e", ẽ: "e", ẹ: "e",
      É: "E", È: "E", Ẻ: "E", Ẽ: "E", Ẹ: "E",
  
      // ê
      ế: "ê", ề: "ê", ể: "ê", ễ: "ê", ệ: "ê",
      Ế: "Ê", Ề: "Ê", Ể: "Ê", Ễ: "Ê", Ệ: "Ê",
  
      // i
      í: "i", ì: "i", ỉ: "i", ĩ: "i", ị: "i",
      Í: "I", Ì: "I", Ỉ: "I", Ĩ: "I", Ị: "I",
  
      // o
      ó: "o", ò: "o", ỏ: "o", õ: "o", ọ: "o",
      Ó: "O", Ò: "O", Ỏ: "O", Õ: "O", Ọ: "O",
  
      // ô
      ố: "ô", ồ: "ô", ổ: "ô", ỗ: "ô", ộ: "ô",
      Ố: "Ô", Ồ: "Ô", Ổ: "Ô", Ỗ: "Ô", Ộ: "Ô",
  
      // ơ
      ớ: "ơ", ờ: "ơ", ở: "ơ", ỡ: "ơ", ợ: "ơ",
      Ớ: "Ơ", Ờ: "Ơ", Ở: "Ơ", Ỡ: "Ơ", Ợ: "Ơ",
  
      // u
      ú: "u", ù: "u", ủ: "u", ũ: "u", ụ: "u",
      Ú: "U", Ù: "U", Ủ: "U", Ũ: "U", Ụ: "U",
  
      // ư
      ứ: "ư", ừ: "ư", ử: "ư", ữ: "ư", ự: "ư",
      Ứ: "Ư", Ừ: "Ư", Ử: "Ư", Ữ: "Ư", Ự: "Ư",
  
      // y
      ý: "y", ỳ: "y", ỷ: "y", ỹ: "y", ỵ: "y",
      Ý: "Y", Ỳ: "Y", Ỷ: "Y", Ỹ: "Y", Ỵ: "Y",
    };
  
    return str
      .split("")
      .map(ch => map[ch] || ch)
      .join("");
  }
  
  // Get the numeric value of a character (A=0, Z=25) for English
  private static getCharValue(char: string): number {
    return CaesarCipher.ALPHABET.indexOf(char.toUpperCase());
  }
  
  // Get the character from a numeric value for English
  private static getValueChar(value: number): string {
    // Ensure the value is within 0-25
    const normalizedValue = ((value % CaesarCipher.ALPHABET_SIZE) + CaesarCipher.ALPHABET_SIZE) % CaesarCipher.ALPHABET_SIZE;
    return CaesarCipher.ALPHABET[normalizedValue];
  }
  
  // Get the numeric value of a Vietnamese character (A=0, Y=28)
  private static getVnCharValue(char: string): number {
    // First remove any diacritics to get the base character
    const baseChar = this.removeDiacritics(char);
    return CaesarCipher.VN_ALPHABET.indexOf(baseChar.toUpperCase());
  }
  
  // Get the Vietnamese character from a numeric value
  private static getVnValueChar(value: number): string {
    // Ensure the value is within 0-28
    const normalizedValue = ((value % CaesarCipher.VN_ALPHABET_SIZE) + CaesarCipher.VN_ALPHABET_SIZE) % CaesarCipher.VN_ALPHABET_SIZE;
    return CaesarCipher.VN_ALPHABET[normalizedValue];
  }
  
  // Format a numeric value with leading zero if needed
  private static formatNumericValue(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
  
  // Encode a single character
  private static encodeChar(char: string, shift: number): { char: string, steps: StepResult | null } {
    // Skip non-alphabet characters
    if (!/[a-zA-Z]/.test(char)) {
      return { char, steps: null };
    }
    
    const value = this.getCharValue(char);
    const newValue = (value + shift) % this.ALPHABET_SIZE;
    const newChar = this.getValueChar(newValue);
    
    const steps: StepResult = {
      plaintext: char.toLowerCase(),
      numericValue: value,
      computation: `(${this.formatNumericValue(value)} + ${shift}) mod ${this.ALPHABET_SIZE}`,
      result: newValue,
      resultChar: newChar
    };
    
    // Preserve the original case
    const resultChar = char === char.toUpperCase() ? newChar.toUpperCase() : newChar.toLowerCase();
    
    return { 
      char: resultChar, 
      steps 
    };
  }
  
  // Decode a single character
  private static decodeChar(char: string, shift: number): { char: string, steps: StepResult | null } {
    // Skip non-alphabet characters
    if (!/[a-zA-Z]/.test(char)) {
      return { char, steps: null };
    }
    
    const value = this.getCharValue(char);
    const newValue = ((value - shift) % this.ALPHABET_SIZE + this.ALPHABET_SIZE) % this.ALPHABET_SIZE;
    const newChar = this.getValueChar(newValue);
    
    const steps: StepResult = {
      plaintext: char.toUpperCase(),
      numericValue: value,
      computation: `(${this.formatNumericValue(value)} - ${shift}) mod ${this.ALPHABET_SIZE}`,
      result: newValue,
      resultChar: newChar
    };
    
    // Preserve the original case
    const resultChar = char === char.toUpperCase() ? newChar.toUpperCase() : newChar.toLowerCase();
    
    return { 
      char: resultChar, 
      steps 
    };
  }
  
  // Encode a string
  public static encode(text: string, shift: number): string {
    return text.split('')
      .map(char => this.encodeChar(char, shift).char)
      .join('');
  }
  
  // Decode a string
  public static decode(text: string, shift: number): string {
    return text.split('')
      .map(char => this.decodeChar(char, shift).char)
      .join('');
  }
  
  // Get step-by-step encoding process
  public static solveEncode(text: string, shift: number): StepResult[] {
    const steps: StepResult[] = [];
    
    text.split('').forEach(char => {
      const result = this.encodeChar(char, shift);
      if (result.steps) {
        steps.push(result.steps);
      }
    });
    
    return steps;
  }
  
  // Get step-by-step decoding process
  public static solveDecode(text: string, shift: number): StepResult[] {
    const steps: StepResult[] = [];
    
    text.split('').forEach(char => {
      const result = this.decodeChar(char, shift);
      if (result.steps) {
        steps.push(result.steps);
      }
    });
    
    return steps;
  }
  
  // Encode a single Vietnamese character
  private static encodeVnChar(char: string, shift: number): { char: string, steps: StepResult | null } {
    // Skip non-Vietnamese alphabet characters
    const baseChar = this.removeDiacritics(char);
    if (this.VN_ALPHABET.indexOf(baseChar.toUpperCase()) === -1) {
      return { char, steps: null };
    }
    
    const value = this.getVnCharValue(char);
    const newValue = (value + shift) % this.VN_ALPHABET_SIZE;
    const newChar = this.getVnValueChar(newValue);
    
    const steps: StepResult = {
      plaintext: char.toLowerCase(),
      numericValue: value,
      computation: `(${value.toString().padStart(2, '0')} + ${shift}) mod ${this.VN_ALPHABET_SIZE}`,
      result: newValue,
      resultChar: newChar
    };
    
    // Preserve the original case
    const resultChar = char === char.toUpperCase() ? newChar.toUpperCase() : newChar.toLowerCase();
    
    return { 
      char: resultChar, 
      steps 
    };
  }
  
  // Decode a single Vietnamese character
  private static decodeVnChar(char: string, shift: number): { char: string, steps: StepResult | null } {
    // Skip non-Vietnamese alphabet characters
    const baseChar = this.removeDiacritics(char);
    if (this.VN_ALPHABET.indexOf(baseChar.toUpperCase()) === -1) {
      return { char, steps: null };
    }
    
    const value = this.getVnCharValue(char);
    const newValue = ((value - shift) % this.VN_ALPHABET_SIZE + this.VN_ALPHABET_SIZE) % this.VN_ALPHABET_SIZE;
    const newChar = this.getVnValueChar(newValue);
    
    const steps: StepResult = {
      plaintext: char.toUpperCase(),
      numericValue: value,
      computation: `(${value.toString().padStart(2, '0')} - ${shift}) mod ${this.VN_ALPHABET_SIZE}`,
      result: newValue,
      resultChar: newChar
    };
    
    // Preserve the original case
    const resultChar = char === char.toUpperCase() ? newChar.toUpperCase() : newChar.toLowerCase();
    
    return { 
      char: resultChar, 
      steps 
    };
  }

  // Vietnamese support
  public static encodeVietnamese(text: string, shift: number): string {
    return text.split('')
      .map(char => this.encodeVnChar(char, shift).char)
      .join('');
  }
  
  public static decodeVietnamese(text: string, shift: number): string {
    return text.split('')
      .map(char => this.decodeVnChar(char, shift).char)
      .join('');
  }
  
  public static solveEncodeVietnamese(text: string, shift: number): StepResult[] {
    const steps: StepResult[] = [];
    
    text.split('').forEach(char => {
      const result = this.encodeVnChar(char, shift);
      if (result.steps) {
        steps.push(result.steps);
      }
    });
    
    return steps;
  }
  
  public static solveDecodeVietnamese(text: string, shift: number): StepResult[] {
    const steps: StepResult[] = [];
    
    text.split('').forEach(char => {
      const result = this.decodeVnChar(char, shift);
      if (result.steps) {
        steps.push(result.steps);
      }
    });
    
    return steps;
  }
}

export default CaesarCipher;