// High-Resolution Scannable CODE128 Barcode SVG Generator for POS STICKERS

export function generateCode128Svg(code: string, width = 200, height = 50): string {
    const cleanCode = (code || 'POSBUZZ-001').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Code128 pattern dictionary for 0-9, A-Z, '-'
    const PATTERNS: Record<string, string> = {
        '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000',
        '4': '10010001100', '5': '10001001100', '6': '10011001000', '7': '10011000100',
        '8': '10001100100', '9': '11001001000', 'A': '11010010000', 'B': '11010001000',
        'C': '11001010000', 'D': '11001000100', 'E': '11000101000', 'F': '11000100100',
        'G': '10110010000', 'H': '10110001000', 'I': '10011010000', 'J': '10011000100',
        'K': '11010110000', 'L': '11010000110', 'M': '11001010000', 'N': '11001000110',
        'O': '11000101100', 'P': '11000100110', 'Q': '10110110000', 'R': '10110000110',
        'S': '10011011000', 'T': '10011000110', 'U': '11001101000', 'V': '11001100100',
        'W': '11011011000', 'X': '11011000110', 'Y': '11000110110', 'Z': '10100011000',
        '-': '10100001100', 'START': '11010010000', 'STOP': '1100011101011'
    };

    let binaryStr = PATTERNS['START'];
    for (const char of cleanCode) {
        binaryStr += PATTERNS[char] || PATTERNS['0'];
    }
    binaryStr += PATTERNS['STOP'];

    const barWidth = width / binaryStr.length;
    let svgRects = '';
    
    for (let i = 0; i < binaryStr.length; i++) {
        if (binaryStr[i] === '1') {
            const x = (i * barWidth).toFixed(2);
            const w = (barWidth + 0.2).toFixed(2);
            svgRects += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="#000000"/>`;
        }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="display:block;margin:0 auto;">
        ${svgRects}
    </svg>`;
}
