import fs from 'fs';
import * as pdfParser from 'pdf-parse';

const filePath = './uploads/resume-kW0Zafd4hGUbGV5pmNShiM1Lp9I2-1780746517460.pdf';

if (fs.existsSync(filePath)) {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const parser = new pdfParser.PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    console.log('PDF PARSE SUCCESSFUL!');
    console.log('RESULT TYPE:', typeof result);
    console.log('RESULT KEYS:', Object.keys(result));
    const textContent = typeof result === 'string' ? result : (result.text || '');
    console.log('TEXT PREVIEW LENGTH:', textContent.length);
    console.log('TEXT:', textContent.substring(0, 500));
  } catch (err) {
    console.error('PDF PARSING FAILED:', err);
  }
} else {
  console.log('File does not exist at:', filePath);
}
