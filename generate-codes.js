const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const cliProgress = require('cli-progress');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  totalCodes: 8000, // Total unique codes to generate
  prefix: 'Prefix', // Code prefix
  codeLength: 11, // Total length of the code including prefix (Prefix + 5 chars)
  codeType: 'alphanumeric', // alphanumeric | numeric | alphabetic
  imageSize: 600, // QR code image size in pixels
  imageFormat: 'png', // Image file format
  errorCorrectionLevel: 'H', // High error correction (30%)
  outputFolder: 'qr_codes', // Output folder for QR code images
  csvFile: 'qr_codes.csv' // Output CSV file name
};

// ============================================
// APPLICATION METADATA
// ============================================
const APP_INFO = {
  name: 'Bulk QR Code Generator',
  version: '1.0.0',
  developer: 'Shetty Bro',
  github: 'https://github.com/ShettyBro',
  description: 'High-performance bulk QR code generation utility',
  license: 'MIT'
};

const CODE_TYPES = {
  '1': { name: 'alphanumeric', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' },
  '2': { name: 'numeric', chars: '0123456789' },
  '3': { name: 'alphabetic', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Prints a professional banner with app info
 */
function printBanner() {
  console.clear();
  console.log('\n');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║                                                  ║');
  console.log('  ║          🎉  BULK QR CODE GENERATOR  🎉          ║');
  console.log('  ║                                                  ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`  📱 ${APP_INFO.name.toUpperCase()}`);
  console.log('  ─────────────────────────────────────────────────────\n');
  console.log(`  Version: v${APP_INFO.version}`);
  console.log(`  Developer: ${APP_INFO.developer}`);
  console.log(`  GitHub: ${APP_INFO.github}`);
  console.log(`  License: ${APP_INFO.license}`);
  console.log(`  Description: ${APP_INFO.description}\n`);
  console.log('  ─────────────────────────────────────────────────────\n');
}

/**
 * Prints a section divider
 */
function printDivider(title = '') {
  const line = '═'.repeat(60);
  if (title) {
    console.log(`\n  ${title}`);
    console.log(`  ${line}\n`);
  } else {
    console.log(`\n  ${line}\n`);
  }
}

/**
 * Prints a success message
 */
function printSuccess(message) {
  console.log(`  ✅ ${message}`);
}

/**
 * Prints an info message
 */
function printInfo(message) {
  console.log(`  ℹ️  ${message}`);
}

/**
 * Prints a warning message
 */
function printWarning(message) {
  console.log(`  ⚠️  ${message}`);
}

/**
 * Prints an error message
 */
function printError(message) {
  console.log(`  ❌ ${message}`);
}

/**
 * Returns the character set for the currently selected code type
 */
function getCharset() {
  const codeType = Object.values(CODE_TYPES).find(type => type.name === CONFIG.codeType);

  if (!codeType) {
    throw new Error(`Invalid codeType: ${CONFIG.codeType}`);
  }

  return codeType.chars;
}

/**
 * Generates a random character from the selected charset
 */
function getRandomChar(chars) {
  return chars.charAt(Math.floor(Math.random() * chars.length));
}


// Generates a unique code with the specified prefix


function generateUniqueCode(existingCodes) {
  let code;
  let attempts = 0;
  const maxAttempts = 100;
  const chars = getCharset();
  
  do {
    // Generate random characters to complete the code
    let randomPart = '';
    for (let i = 0; i < CONFIG.codeLength - CONFIG.prefix.length; i++) { 
      randomPart += getRandomChar(chars);
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
 * Validates configuration and capacity before generation starts
 */
function validateConfig() {
  const randomLength = CONFIG.codeLength - CONFIG.prefix.length;
  const charset = getCharset();

  if (randomLength <= 0) {
    throw new Error(
      `Invalid config: codeLength (${CONFIG.codeLength}) must be greater than prefix length (${CONFIG.prefix.length})`
    );
  }

  if (!Number.isInteger(CONFIG.totalCodes) || CONFIG.totalCodes <= 0) {
    throw new Error(`Invalid config: totalCodes (${CONFIG.totalCodes}) must be a positive integer`);
  }

  const charsetSize = charset.length;
  const maxUniqueCodes = Math.pow(charsetSize, randomLength);

  if (CONFIG.totalCodes > maxUniqueCodes) {
    throw new Error(
      `Invalid config: totalCodes (${CONFIG.totalCodes}) exceeds maximum possible unique codes (${maxUniqueCodes}) for type ${CONFIG.codeType}, prefix "${CONFIG.prefix}" and codeLength ${CONFIG.codeLength}`
    );
  }

  return {
    maxUniqueCodes,
    randomLength,
    charsetSize
  };
}

/**
 * Reads and validates a positive integer from CLI input
 */
async function askPositiveInteger(rl, prompt, defaultValue) {
  while (true) {
    const value = (await rl.question(`  ${prompt} [${defaultValue}]: `)).trim();
    const parsed = value === '' ? defaultValue : Number.parseInt(value, 10);

    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }

    printWarning('Please enter a positive integer.');
  }
}

/**
 * Collects runtime configuration from user input
 */
async function collectUserConfig() {
  const rl = readline.createInterface({ input, output });

  try {
    printDivider('📋 CONFIGURATION WIZARD');

    // Step 1: Choose code type
    console.log('  Choose code character set:\n');
    console.log('     1️⃣  Alphanumeric   [A-Z, 0-9]  (36 characters)');
    console.log('     2️⃣  Numeric        [0-9]       (10 characters)');
    console.log('     3️⃣  Alphabetic     [A-Z]       (26 characters)\n');

    while (true) {
      const typeChoice = (await rl.question(`  🎯 Select code character set (1/2/3) [1]: `)).trim() || '1';
      const selected = CODE_TYPES[typeChoice];

      if (selected) {
        CONFIG.codeType = selected.name;
        break;
      }

      printWarning('Invalid option. Please select 1, 2, or 3.');
    }

    printSuccess(`Selected character set: ${CONFIG.codeType}\n`);

    // Step 2: Ask about prefix
    let hasPrefix = false;
    while (true) {
      const prefixChoice = (await rl.question(`  🏷️  Do you want to add a prefix? (yes/no) [yes]: `)).trim().toLowerCase() || 'yes';
      
      if (prefixChoice === 'yes' || prefixChoice === 'y') {
        hasPrefix = true;
        break;
      } else if (prefixChoice === 'no' || prefixChoice === 'n') {
        hasPrefix = false;
        CONFIG.prefix = '';
        break;
      }
      
      printWarning('Please enter yes or no.');
    }

    // Step 3: If prefix, ask for it
    if (hasPrefix) {
      const prefixInput = (await rl.question(`  🏷️  Enter code prefix: `)).trim();
      if (prefixInput) {
        CONFIG.prefix = prefixInput;
        printSuccess(`Prefix set to: "${CONFIG.prefix}"\n`);
      } else {
        CONFIG.prefix = '';
        printWarning('No prefix provided. Using full length for codes.\n');
      }
    } else {
      printSuccess('No prefix. Using full length for codes.\n');
    }

    // Step 4: Ask for code length
    CONFIG.codeLength = await askPositiveInteger(rl, '📏 QR code length', CONFIG.codeLength);

    // Step 5: Ask for total codes
    CONFIG.totalCodes = await askPositiveInteger(rl, '🔢 Number of QR codes to generate', CONFIG.totalCodes);

    // Step 6: Confirm to begin
    printDivider();
    console.log('  Review your configuration:\n');
    console.log(`     • Code type: ${CONFIG.codeType}`);
    console.log(`     • Prefix: "${CONFIG.prefix || '(none)'}'`);
    console.log(`     • Code length: ${CONFIG.codeLength}`);
    console.log(`     • Total codes: ${CONFIG.totalCodes}\n`);

    while (true) {
      const beginChoice = (await rl.question(`  ▶️  Let's begin generation? (yes/no) [yes]: `)).trim().toLowerCase() || 'yes';
      
      if (beginChoice === 'yes' || beginChoice === 'y') {
        break;
      } else if (beginChoice === 'no' || beginChoice === 'n') {
        console.log('\n  👋 Exiting...\n');
        process.exit(0);
      }
      
      printWarning('Please enter yes or no.');
    }

    printSuccess('Starting generation...\n');

  } finally {
    rl.close();
  }
}

/**
 * Creates output folder if it doesn't exist
 */
function ensureOutputFolder() {
  if (!fs.existsSync(CONFIG.outputFolder)) {
    fs.mkdirSync(CONFIG.outputFolder);
    printSuccess(`Created folder: ./${CONFIG.outputFolder}/`);
  } else {
    printSuccess(`Folder exists: ./${CONFIG.outputFolder}/`);
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
    printError(`Failed to generate QR for ${code}: ${err.message}`);
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
  printSuccess(`CSV file saved: ${CONFIG.csvFile}`);
  printInfo(`Total codes: ${codes.length}`);
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

async function generateQRCodes() {
  printBanner();
  
  await collectUserConfig();
  const { maxUniqueCodes, randomLength, charsetSize } = validateConfig();

  printDivider('⚙️  GENERATION CONFIGURATION');
  
  console.log(`  📊 Total codes to generate: ${CONFIG.totalCodes}`);
  console.log(`  🏷️  Prefix: "${CONFIG.prefix || '(none)'}" (${CONFIG.prefix.length} chars)`);
  console.log(`  🎯 Code type: ${CONFIG.codeType.toUpperCase()}`);
  console.log(`  📝 Random suffix length: ${randomLength} characters`);
  console.log(`  🔤 Character set size: ${charsetSize}`);
  console.log(`  ✨ Max unique codes possible: ${maxUniqueCodes.toLocaleString()}`);
  console.log(`  📏 Total code length: ${CONFIG.codeLength} characters`);
  console.log(`  🖼️  Image size: ${CONFIG.imageSize}×${CONFIG.imageSize} pixels`);
  console.log(`  🛡️  Error correction: Level ${CONFIG.errorCorrectionLevel} (30% recovery)`);
  console.log(`  📁 Output folder: ${CONFIG.outputFolder}/`);
  console.log(`  📊 CSV file: ${CONFIG.csvFile}`);
  
  printDivider();
  
  // Ensure output folder exists
  ensureOutputFolder();
  
  printDivider('🔢 GENERATING UNIQUE CODES');
  console.log(`  Generating ${CONFIG.totalCodes} unique codes...\n`);
  
  const codes = new Set();
  let lastProgressReport = 0;
  
  while (codes.size < CONFIG.totalCodes) {
    const code = generateUniqueCode(codes);
    codes.add(code);
    
    // Show progress every 1000 codes
    if (codes.size % 1000 === 0 && codes.size !== lastProgressReport) {
      const percentage = ((codes.size / CONFIG.totalCodes) * 100).toFixed(1);
      console.log(`     ${codes.size}/${CONFIG.totalCodes} (${percentage}%) ✓`);
      lastProgressReport = codes.size;
    }
  }
  
  console.log(`\n  ✅ Successfully generated ${codes.size} unique codes!\n`);
  
  // Convert Set to Array for easier processing
  const codesArray = Array.from(codes);
  
  // Save codes to CSV
  saveToCSV(codesArray);
  
  printDivider('🎨 CREATING QR CODE IMAGES');
  console.log(`  Processing ${CONFIG.totalCodes} QR code images...\n`);
  
  const progressBar = new cliProgress.SingleBar({
    format: '     Progress |{bar}| {percentage}% | {value}/{total} | ETA: {eta_formatted}',
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
  printDivider('✅ GENERATION COMPLETE');
  
  console.log(`\n  🎉 QR Code Generation Finished!\n`);
  console.log(`     ✅ Successfully created: ${successCount.toLocaleString()} QR codes`);
  
  if (failCount > 0) {
    console.log(`     ❌ Failed: ${failCount} QR codes`);
  }
  
  console.log(`\n     📁 Location: ./${CONFIG.outputFolder}/`);
  console.log(`     📊 CSV file: ${CONFIG.csvFile}`);
  console.log(`     💾 Total size: ~${Math.ceil((successCount * 15) / 1024)} MB`);
  
  console.log(`\n  ─────────────────────────────────────────────────────`);
  console.log(`  🚀 Ready for printing and database import!\n`);

  // Add spacer for scrollability
  console.log('\n');
  console.log('  ═══════════════════════════════════════════════════════\n');
  
  // Summary details
  console.log(`  📊 GENERATION SUMMARY\n`);
  console.log(`     Total codes generated: ${successCount.toLocaleString()}`);
  console.log(`     Code prefix: "${CONFIG.prefix || '(none)'}"`);
  console.log(`     Code type: ${CONFIG.codeType}`);
  console.log(`     Code length: ${CONFIG.codeLength} characters`);
  console.log(`     Image size: ${CONFIG.imageSize}×${CONFIG.imageSize} pixels`);
  console.log(`     Image format: ${CONFIG.imageFormat.toUpperCase()}`);
  console.log(`     Error correction: Level ${CONFIG.errorCorrectionLevel}`);
  console.log(`     Generated at: ${new Date().toISOString()}`);
  
  console.log(`\n  📁 FILES CREATED\n`);
  console.log(`     QR Images: ${CONFIG.outputFolder}/ (${successCount} files)`);
  console.log(`     CSV Tracking: ${CONFIG.csvFile}`);
  console.log(`     Total output size: ~${Math.ceil((successCount * 15) / 1024)} MB`);
  
  console.log(`\n  🔧 NEXT STEPS\n`);
  console.log(`     1. Review generated QR codes in ${CONFIG.outputFolder}/ folder`);
  console.log(`     2. Import CSV file into your database or system`);
  console.log(`     3. Print QR codes for distribution`);
  console.log(`     4. Use unique codes for tracking/verification`);
  
  console.log(`\n  ─────────────────────────────────────────────────────`);
  console.log(`\n  👨‍💻 DEVELOPER\n`);
  console.log(`     Name: ${APP_INFO.developer}`);
  console.log(`     GitHub: ${APP_INFO.github}`);
  console.log(`     Repository: shettyBro/Bulk-QR-Generator`);
  
  console.log(`\n  ✨ FEATURES USED\n`);
  console.log(`     ✓ Bulk QR code generation`);
  console.log(`     ✓ Unique code collision prevention`);
  console.log(`     ✓ High error correction (30% recovery)`);
  console.log(`     ✓ Batch processing for memory efficiency`);
  console.log(`     ✓ Multiple character set types`);
  console.log(`     ✓ CSV export with timestamps`);
  console.log(`     ✓ Progress tracking and ETA`);
  
  console.log(`\n  📝 SPECIFICATIONS\n`);
  console.log(`     Node.js version: v${process.versions.node}`);
  console.log(`     Platform: ${process.platform}`);
  console.log(`     Engine: QRCode 1.5.3 + cli-progress 3.12.0`);
  
  console.log(`\n  🎯 OUTPUT READY FOR\n`);
  console.log(`     • Registration systems`);
  console.log(`     • Ticketing platforms`);
  console.log(`     • Asset/inventory tracking`);
  console.log(`     • Attendance tracking`);
  console.log(`     • Verification workflows`);
  
  console.log(`\n  ═══════════════════════════════════════════════════════`);
  console.log(`\n  Thank you for using Bulk QR Code Generator!\n`);
  console.log(`  🔗 Follow updates: ${APP_INFO.github}\n\n`);
}

// ============================================
// RUN THE GENERATOR
// ============================================

generateQRCodes().catch(err => {
  console.log('\n');
  printError(`${err.message}`);
  console.log(`\n  Stack trace:\n  ${err.stack.split('\n').join('\n  ')}\n`);
  process.exit(1);
});