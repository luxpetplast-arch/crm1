// Qop yorliq printeri utility

export interface BagLabelData {
  productName: string;      // Masalan: "15gr"
  productType: string;        // Masalan: "QORA"
  unitsPerBag: number;      // Masalan: 4000
  productionDate: string;   // Masalan: "2026-03-23"
  barcode: string;          // 12 ta raqam
  bagNumber: number;        // Qop raqami (1, 2, 3...)
  workerId: string;         // Ishchi raqami
  batchId?: string;         // Partiya ID
}

export interface BagLabelConfig {
  logoText: string;
  companyName: string;
  address: string;
  phone: string;
  madeIn: string;
  additionalInfo?: string;
}

const defaultConfig: BagLabelConfig = {
  logoText: 'LUX PET PLAST',
  companyName: 'Lux Pet Plast',
  address: 'Buxoro Toshkent',
  phone: 'Tel: 904444444',
  madeIn: 'Made in Uzbekistan',
  additionalInfo: ''
};

// 12-talik barkod generatsiya qilish
// Format: DDMM + PP + TT + WW + BB
// DDMM: Sana (kun.oy)
// PP: Mahsulot kodi (2 raqam)
// TT: Tur kodi (2 raqam)
// WW: Ishchi raqami (2 raqam)
// BB: Qop raqami (2 raqam)
export function generateBarcode(
  date: Date,
  productCode: string,
  typeCode: string,
  workerId: string,
  bagNumber: number
): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayMonth = day + month;
  
  // Mahsulot kodini 2 raqamga o'tkazish
  const prodCode = productCode.padStart(2, '0').slice(-2);
  
  // Tur kodini 2 raqamga o'tkazish
  const typeCodeFormatted = typeCode.padStart(2, '0').slice(-2);
  
  // Ishchi raqamini 2 raqamga o'tkazish
  const workerCode = workerId.padStart(2, '0').slice(-2);
  
  // Qop raqamini 2 raqamga o'tkazish
  const bagCode = String(bagNumber).padStart(2, '0').slice(-2);
  
  return dayMonth + prodCode + typeCodeFormatted + workerCode + bagCode;
}

// Barkodni tekshirish (validatsiya)
export function validateBarcode(barcode: string): boolean {
  return /^\d{12}$/.test(barcode);
}

// SVG barkod generatsiya qilish (EAN-12 formatida)
export function generateBarcodeSVG(barcode: string, width: number = 200, height: number = 80): string {
  if (!validateBarcode(barcode)) {
    throw new Error('Barkod 12 ta raqamdan iborat bo\'lishi kerak');
  }

  // EAN-12 encoding patterns
  const leftPatterns: Record<string, string> = {
    '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101', '4': '0100011',
    '5': '0110001', '6': '0101111', '7': '0111011', '8': '0110111', '9': '0001011'
  };
  
  const rightPatterns: Record<string, string> = {
    '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010', '4': '1011100',
    '5': '1001110', '6': '1010000', '7': '1000100', '8': '1001000', '9': '1110100'
  };

  const guard = '101';
  const center = '01010';

  // Build barcode pattern
  let pattern = guard;
  
  // Left half (6 digits)
  for (let i = 0; i < 6; i++) {
    pattern += leftPatterns[barcode[i]];
  }
  
  pattern += center;
  
  // Right half (6 digits)
  for (let i = 6; i < 12; i++) {
    pattern += rightPatterns[barcode[i]];
  }
  
  pattern += guard;

  // Calculate bar widths
  const totalBars = pattern.length;
  const barWidth = width / totalBars;
  
  // Build SVG bars
  let bars = '';
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      bars += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${height - 20}" fill="#000"/>`;
    }
  }

  // Add numbers below bars
  const leftNumbers = barcode.slice(0, 6).split('').join(' ');
  const rightNumbers = barcode.slice(6, 12).split('').join(' ');
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${bars}
      <text x="${width * 0.25}" y="${height - 2}" font-family="monospace" font-size="14" text-anchor="middle">${leftNumbers}</text>
      <text x="${width * 0.75}" y="${height - 2}" font-family="monospace" font-size="14" text-anchor="middle">${rightNumbers}</text>
    </svg>
  `;
}

// Yagona yorliq HTML generatsiya qilish
export function generateSingleLabelHTML(data: BagLabelData, config: BagLabelConfig = defaultConfig): string {
  const barcodeSVG = generateBarcodeSVG(data.barcode, 160, 50);
  
  return `
    <div class="bag-label">
      <div class="logo">${config.logoText}</div>
      <div class="product-name">${data.productName}</div>
      <div class="product-type">${data.productType}</div>
      <div class="units">${data.unitsPerBag} dona</div>
      <div class="date">Sana: ${data.productionDate}</div>
      <div class="barcode">${barcodeSVG}</div>
      <div class="footer">
        <div class="made-in">${config.madeIn}</div>
        <div class="company">${config.companyName}</div>
        <div class="address">${config.address}</div>
        <div class="phone">${config.phone}</div>
        <div class="bag-info">Qop #${data.bagNumber} | Ishchi: ${data.workerId}</div>
      </div>
    </div>
  `;
}

// A4 sahifada 8 ta yorliq generatsiya qilish (2x4 layout)
export function generateBagLabelsPageHTML(
  labels: BagLabelData[],
  config: BagLabelConfig = defaultConfig
): string {
  const labelsHTML = labels.map(label => generateSingleLabelHTML(label, config)).join('');
  
  return `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Qop Yorliqlari</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            width: 210mm;
            height: 297mm;
            padding: 10mm;
            background: white;
        }
        
        .labels-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 5mm;
            width: 100%;
            height: 100%;
        }
        
        .bag-label {
            border: 1px solid #000;
            padding: 4mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            background: white;
            height: 66mm;
            overflow: hidden;
        }
        
        .logo {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 2mm;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
            width: 100%;
        }
        
        .product-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 1mm;
        }
        
        .product-type {
            font-size: 12px;
            color: #333;
            margin-bottom: 1mm;
        }
        
        .units {
            font-size: 10px;
            background: #f0f0f0;
            padding: 1mm 3mm;
            border-radius: 2mm;
            margin-bottom: 1mm;
        }
        
        .date {
            font-size: 9px;
            color: #666;
            margin-bottom: 1mm;
        }
        
        .barcode {
            margin: 1mm 0;
        }
        
        .barcode svg {
            max-width: 100%;
            height: auto;
        }
        
        .footer {
            margin-top: auto;
            font-size: 7px;
            line-height: 1.3;
            color: #444;
            width: 100%;
            border-top: 0.5px solid #ddd;
            padding-top: 1mm;
        }
        
        .made-in {
            font-weight: bold;
            font-size: 8px;
        }
        
        .company {
            font-weight: bold;
        }
        
        .bag-info {
            margin-top: 1mm;
            font-size: 6px;
            color: #666;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 10mm;
            }
            
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="labels-container">
        ${labelsHTML}
    </div>
    
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
  `;
}

// 80mm printerga moslashtirilgan yorliq chop etish
export function printBagLabels80mm(
  labels: BagLabelData[],
  config?: BagLabelConfig
): void {
  if (!labels.length) {
    alert('Yorliqlar mavjud emas!');
    return;
  }
  
  const html = generate80mmLabelsHTML(labels, config);
  
  const printWindow = window.open('', '_blank', 'width=320,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Yorliqlarni chop etish uchun popup oynalariga ruxsat bering!');
  }
}

export function generate80mmLabelsHTML(
  labels: BagLabelData[],
  config: BagLabelConfig = defaultConfig
): string {
  // Haqiqiy qop yorlig'i ko'rinishida
  const labelsHTML = labels.map((label, index) => {
    const isLast = index === labels.length - 1;
    return generate80mmBagLabel(label, config, isLast);
  }).join('');
  
  return `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Qop Yorliqlari 80mm</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            width: 80mm;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .label-wrapper {
            width: 80mm;
            padding: 3mm;
            page-break-inside: avoid;
            page-break-after: always;
        }
        
        .label-wrapper:last-child {
            page-break-after: auto;
        }
        
        .bag-label-card {
            border: 2px solid #000;
            background: white;
            width: 74mm;
            margin: 0 auto;
            border-radius: 2mm;
        }
        
        .row {
            padding: 2mm 3mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header-row {
            background: #f0f0f0;
            color: #000;
            text-align: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2px;
            padding: 3mm;
            border-bottom: 2px solid #000;
        }
        
        .big-text {
            font-size: 20px;
            font-weight: bold;
            justify-content: center;
            padding: 3mm;
            background: #fafafa;
        }
        
        .label-text {
            font-size: 10px;
            color: #666;
            font-weight: normal;
        }
        
        .value-text {
            font-size: 13px;
            font-weight: bold;
            color: #000;
        }
        
        .value-text.big {
            font-size: 15px;
        }
        
        .thick-line {
            border-top: 2px solid #000;
            width: 100%;
            margin: 0;
        }
        
        .barcode-row {
            padding: 2mm;
            text-align: center;
            background: #f9f9f9;
        }
        
        .barcode {
            width: 100%;
        }
        
        .barcode svg {
            max-width: 100%;
            height: auto;
        }
        
        .barcode-number {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 2px;
            margin-top: 1mm;
            color: #333;
        }
        
        .footer-row {
            flex-direction: column;
            gap: 0.5mm;
            font-size: 8px;
            text-align: center;
            padding: 2mm;
            background: #f0f0f0;
            border-top: 2px solid #000;
        }
        
        .footer-row div:first-child {
            font-weight: bold;
            font-size: 9px;
        }
        
        .separator {
            height: 6mm;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .separator-line {
            width: 60mm;
            border-top: 2px dashed #666;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .no-print {
                display: none !important;
            }
            
            .label-wrapper {
                page-break-inside: avoid;
                page-break-after: always;
            }
            
            .label-wrapper:last-child {
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
    ${labelsHTML}
    
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
  `;
}

// 80mm yagona yorliq HTML generatsiya qilish (qatordagi dizayn - boxesiz)
function generate80mmBagLabel(
  data: BagLabelData,
  config: BagLabelConfig = defaultConfig,
  isLast: boolean
): string {
  const barcodeSVG = generateBarcodeSVG(data.barcode, 320, 80);
  
  const thickLine = '<div class="thick-line"></div>';
  
  const labelHTML = `
    <div class="label-wrapper">
      <div class="bag-label-card">
        <div class="row header-row">
          ${config.logoText}
        </div>
        
        ${thickLine}
        
        <div class="row big-text">
          ${data.unitsPerBag} dona
        </div>
        
        ${thickLine}
        
        <div class="row">
          <span class="label-text">Sana:</span>
          <span class="value-text">${data.productionDate}</span>
        </div>
        
        ${thickLine}
        
        <div class="row">
          <span class="label-text">Maxsulot:</span>
          <span class="value-text big">${data.productName}</span>
        </div>
        
        ${thickLine}
        
        <div class="row">
          <span class="label-text">Turi:</span>
          <span class="value-text big">${data.productType}</span>
        </div>
        
        ${thickLine}
        
        <div class="row">
          <span class="label-text">Qop №:</span>
          <span class="value-text">${data.bagNumber}</span>
        </div>
        
        ${thickLine}
        
        <div class="row">
          <span class="label-text">Ishchi:</span>
          <span class="value-text">${data.workerId}</span>
        </div>
        
        ${thickLine}
        
        <div class="barcode-row">
          <div class="barcode">${barcodeSVG}</div>
          <div class="barcode-number">${data.barcode}</div>
        </div>
        
        ${thickLine}
        
        <div class="row footer-row">
          <div>${config.madeIn}</div>
          <div>${config.companyName}</div>
          <div>${config.phone}</div>
        </div>
      </div>
    </div>
  `;
  
  if (isLast) {
    return labelHTML;
  }
  
  return labelHTML + `
    <div class="separator">
      <div class="separator-line"></div>
    </div>
  `;
}

// Eski funksiya - export qilingan (compatibility uchun)
export function generate80mmSingleLabel(
  data: BagLabelData,
  config: BagLabelConfig = defaultConfig
): string {
  const barcodeSVG = generateBarcodeSVG(data.barcode, 160, 50);
  
  return `
    <div class="bag-label">
      <div class="logo">${config.logoText}</div>
      <div class="product-name">${data.productName}</div>
      <div class="product-type">${data.productType}</div>
      <div class="units">${data.unitsPerBag} dona</div>
      <div class="date">Sana: ${data.productionDate}</div>
      <div class="barcode">${barcodeSVG}</div>
      <div class="footer">
        <div class="made-in">${config.madeIn}</div>
        <div class="company">${config.companyName}</div>
        <div class="address">${config.address}</div>
        <div class="phone">${config.phone}</div>
        <div class="bag-info">Qop #${data.bagNumber} | Ishchi: ${data.workerId}</div>
      </div>
    </div>
  `;
}

// Qop yorliqlarini chop etish
export function printBagLabels(
  labels: BagLabelData[],
  config?: BagLabelConfig
): void {
  if (!labels.length) {
    alert('Yorliqlar mavjud emas!');
    return;
  }
  
  const html = generateBagLabelsPageHTML(labels, config);
  
  const printWindow = window.open('', '_blank', 'width=800,height=1100');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Yorliqlarni chop etish uchun popup oynalariga ruxsat bering!');
  }
}

// Mahsulot uchun yorliq ma'lumotlarini tayyorlash
export function prepareBagLabels(
  productName: string,
  productType: string,
  unitsPerBag: number,
  quantity: number,
  workerId: string,
  productCode: string,
  typeCode: string,
  date?: Date
): BagLabelData[] {
  const productionDate = date || new Date();
  const labels: BagLabelData[] = [];
  
  for (let i = 1; i <= quantity; i++) {
    const barcode = generateBarcode(
      productionDate,
      productCode,
      typeCode,
      workerId,
      i
    );
    
    labels.push({
      productName,
      productType,
      unitsPerBag,
      productionDate: productionDate.toLocaleDateString('uz-UZ'),
      barcode,
      bagNumber: i,
      workerId
    });
  }
  
  return labels;
}

// Qop yorliqlarini ma'lumotlar bazasiga saqlash
export async function saveBagLabelsToDatabase(
  labels: BagLabelData[],
  productId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Avtorizatsiya tokeni topilmadi');
    }

    const response = await fetch('/api/bag-labels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        labels: labels.map(label => ({
          barcode: label.barcode,
          productId: productId,
          productName: label.productName,
          productType: label.productType,
          unitsPerBag: label.unitsPerBag,
          bagNumber: label.bagNumber,
          workerId: label.workerId,
          productionDate: label.productionDate
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Yorliqlarni saqlashda xatolik');
    }

    const result = await response.json();
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error saving bag labels:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Qop yorliqlarini chop etish va saqlash
export async function printAndSaveBagLabels(
  labels: BagLabelData[],
  productId: string,
  config?: BagLabelConfig
): Promise<{ success: boolean; error?: string }> {
  // Avval chop etish
  printBagLabels(labels, config);
  
  // Keyin ma'lumotlar bazasiga saqlash
  const saveResult = await saveBagLabelsToDatabase(labels, productId);
  
  if (!saveResult.success) {
    console.warn('Labels printed but not saved to database:', saveResult.error);
    return { 
      success: true,
      error: `Chop etildi, lekin bazaga saqlanmadi: ${saveResult.error}` 
    };
  }
  
  return { success: true };
}
