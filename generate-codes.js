const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const cliProgress = require('cli-progress');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  totalCodes: 8000, // Total unique codes to generate
  prefix: 'Prefix',// Code prefix
  codeLength: 8, // Total length of the code including prefix
  imageSize: 600, // QR code image size in pixels
  imageFormat: 'png', // Image file format
  errorCorrectionLevel: 'H', // High error correction (30%)
  outputFolder: 'qr_codes', // Output folder for QR code images
  csvFile: 'qr_codes.csv' // Output CSV file name
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates a random alphanumeric character (A-Z, 0-9)
 */
function getRandomChar() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return chars.charAt(Math.floor(Math.random() * chars.length));
}


// Generates a unique code with the specified prefix


function generateUniqueCode(existingCodes) {
  let code;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    // Generate 5 random characters to complete the code
    let randomPart = '';
    for (let i = 0; i < CONFIG.codeLength - CONFIG.prefix.length; i++) { 
      randomPart += getRandomChar();
    }
    code = CONFIG.prefix + randomPart;
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error('Failed to generate unique code after 100 attempts');
    }
  } while (existingCodes.has(code));
  
  return code;
}

/**
 * Creates output folder if it doesn't exist
 */
function ensureOutputFolder() {
  if (!fs.existsSync(CONFIG.outputFolder)) {
    fs.mkdirSync(CONFIG.outputFolder);
    console.log(`✅ Created folder: ${CONFIG.outputFolder}/`);
  } else {
    console.log(`✅ Folder exists: ${CONFIG.outputFolder}/`);
  }
}

/**
 * Generates QR code image for a given code
 */
async function generateQRImage(code, filePath) {
  const options = {
    errorCorrectionLevel: CONFIG.errorCorrectionLevel,
    type: 'png',
    quality: 1, // Maximum quality
    margin: 2, // White border around QR code
    width: CONFIG.imageSize,
    color: {
      dark: '#000000', // Black
      light: '#FFFFFF' // White
    }
  };
  
  try {
    await QRCode.toFile(filePath, code, options);
    return true;
  } catch (err) {
    console.error(`\n❌ Error generating QR for ${code}:`, err.message);
    return false;
  }
}

/**
 * Saves codes to CSV file
 */
function saveToCSV(codes) {
  const header = 'code,generated_at\n';
  const timestamp = new Date().toISOString();
  const rows = codes.map(code => `${code},${timestamp}`).join('\n');
  const csvContent = header + rows;
  
  fs.writeFileSync(CONFIG.csvFile, csvContent, 'utf8');
  console.log(`\n✅ CSV file saved: ${CONFIG.csvFile}`);
  console.log(`   Total codes: ${codes.length}`);
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

async function generateQRCodes() {
  console.log('\n🎯 QR Code Generator');
  console.log('=====================================\n');
  console.log(`📦 Configuration:`);
  console.log(`   - Total codes: ${CONFIG.totalCodes}`);
  console.log(`   - Code format: ${CONFIG.prefix}XXXXX (${CONFIG.codeLength} characters)`);
  console.log(`   - Image size: ${CONFIG.imageSize}x${CONFIG.imageSize} pixels`);
  console.log(`   - Error correction: ${CONFIG.errorCorrectionLevel} (30% recovery)`);
  console.log(`   - Output folder: ${CONFIG.outputFolder}/`);
  console.log(`   - CSV file: ${CONFIG.csvFile}\n`);
  
  // Ensure output folder exists
  ensureOutputFolder();
  
  // Generate unique codes
  console.log(`\n🔢 Generating ${CONFIG.totalCodes} unique codes...`);
  const codes = new Set();
  
  while (codes.size < CONFIG.totalCodes) {
    const code = generateUniqueCode(codes);
    codes.add(code);
    
    // Show progress every 1000 codes
    if (codes.size % 1000 === 0) {
      console.log(`   Generated: ${codes.size}/${CONFIG.totalCodes}`);
    }
  }
  
  console.log(`✅ Generated ${codes.size} unique codes\n`);
  
  // Convert Set to Array for easier processing
  const codesArray = Array.from(codes);
  
  // Save codes to CSV
  saveToCSV(codesArray);
  
  // Generate QR code images with progress bar
  console.log(`\n🎨 Creating QR code images...\n`);
  
  const progressBar = new cliProgress.SingleBar({
    format: '   Progress |{bar}| {percentage}% | {value}/{total} codes | ETA: {eta_formatted}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  
  progressBar.start(CONFIG.totalCodes, 0);
  
  let successCount = 0;
  let failCount = 0;
  
  // Process in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < codesArray.length; i += batchSize) {
    const batch = codesArray.slice(i, i + batchSize);
    
    // Process batch in parallel
    const promises = batch.map(async (code) => {
      const fileName = `${code}.${CONFIG.imageFormat}`;
      const filePath = path.join(CONFIG.outputFolder, fileName);
      const success = await generateQRImage(code, filePath);
      return success;
    });
    
    const results = await Promise.all(promises);
    successCount += results.filter(r => r).length;
    failCount += results.filter(r => !r).length;
    
    progressBar.update(i + batch.length);
  }
  
  progressBar.stop();
  
  // Final summary
  console.log(`\n\n✅ QR Code Generation Complete!`);
  console.log(`=====================================`);
  console.log(`   ✅ Successfully created: ${successCount} QR codes`);
  if (failCount > 0) {
    console.log(`   ❌ Failed: ${failCount} QR codes`);
  }
  console.log(`   📁 Location: ${CONFIG.outputFolder}/`);
  console.log(`   📊 CSV file: ${CONFIG.csvFile}`);
  console.log(`   💾 Total size: ~${Math.ceil((successCount * 15) / 1024)} MB\n`);
  
  console.log(`🎉 Ready for printing and database import!\n`);
}

// ============================================
// RUN THE GENERATOR
// ============================================

generateQRCodes().catch(err => {
  console.error('\n❌ Fatal Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});