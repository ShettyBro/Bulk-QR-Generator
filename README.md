# Bulk QR Code Generator (Node.js)

A high-performance **Node.js utility** for generating **thousands of unique QR codes in bulk**, optimized for **registrations**, **asset tracking**, **access control**, and **verification workflows**.

This project focuses on **reliability, scalability, and print-ready output**, while remaining simple to configure and reuse across different systems.

---

## 📌 Project Overview

This utility automates the generation of **unique, scannable QR codes** at scale.

Each QR code:
- Encodes a **unique identifier**
- Is exported as a **high-resolution PNG image**
- Is tracked in a **CSV file** for external system usage
- Uses **maximum error correction** for robustness

Common use cases include:
- Registration systems
- Ticketing platforms
- Asset or inventory tagging
- Attendance tracking
- Verification and validation workflows

---

## 🤔 Why Use This Tool?

- Designed specifically for **large-scale bulk generation**
- Guarantees **unique codes** using collision prevention
- Produces **print-quality QR images**
- Prevents memory overload using batch processing
- Simple and dependency-light Node.js setup

---

## ✨ Features

- Bulk generation of **thousands of unique QR codes**
- Customizable code prefix and length
- High-resolution **600 × 600 PNG output**
- **QR Error Correction Level H (30% recovery)**
- CSV export with timestamps
- CLI progress bar with ETA
- Batch processing to control memory usage
- Centralized configuration for easy reuse

---

## 🧱 Tech Stack

- **Node.js**
- **qrcode** – QR image generation
- **cli-progress** – CLI progress visualization
- **fs / path** – File and directory handling

---

## 📂 Project Structure

```
bulk-qr-generator/
├── generate-codes.js        # Main QR generation script
├── package.json             # Project metadata & dependencies
├── qr_codes/                # Generated QR images (PNG)
│   ├── PREFIXA1B2C.png
│   ├── PREFIXD4E5F.png
│   └── ...
└── qr_codes.csv             # CSV tracking file
```

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

Ensure the following are installed:

- **Node.js v16 or higher**
- **npm**

Verify installation:

```bash
node --version
npm --version
```

---

### 2️⃣ Installation

```bash
git clone https://github.com/ShettyBro/Bulk-QR-Generator.git
cd bulk-qr-generator
npm install
```

---

### 3️⃣ Generate QR Codes

```bash
node generate-codes.js
```

---

## 📤 Output

### QR Images

- Stored in the `qr_codes/` directory
- Format: PNG
- Resolution: 600 × 600 pixels (default)

---

### CSV File

File: `qr_codes.csv`

```csv
code,generated_at
PREFIXA1B2C,2026-01-01T10:30:15.000Z
PREFIXD4E5F,2026-01-01T10:30:15.000Z
...
```

---

## ⚙️ Configuration

Edit `generate-codes.js`:

```js
const CONFIG = {
  totalCodes: 8000,           // Total unique codes to generate
  prefix: 'PREFIX',           // Code prefix
  codeLength: 8,              // Total code length
  imageSize: 600,             // QR code size in pixels
  imageFormat: 'png',         // Output image format
  errorCorrectionLevel: 'H',  // High error correction (30%)
  outputFolder: 'qr_codes',   // Output folder
  csvFile: 'qr_codes.csv'     // CSV file name
};
```

---

## 🔁 Customization Examples

- Change the prefix for different environments (DEV / PROD)
- Increase `totalCodes` for larger datasets
- Reduce `imageSize` for digital-only workflows
- Use separate output folders per project

---

## 🔐 Uniqueness & Reliability

- Uses an in-memory `Set` to prevent duplicate codes
- Automatically retries generation on collision
- Fails safely if uniqueness cannot be guaranteed
- QR error correction supports up to **30% damage recovery**

---

## 📈 Performance Characteristics

| Metric | Typical Value |
|------|--------------|
| Generation Speed | 500–800 codes/min |
| Memory Usage | ~200–300 MB |
| Image Size | ~10–20 KB per QR |

---

## ⚠️ Limitations

- Not intended for cryptographic or security tokens
- Not designed for real-time QR generation APIs
- Extremely large datasets (>100k) may require tuning

---

## 🛠️ Troubleshooting

```
Issue: Cannot find module 'qrcode'
Solution: Run npm install

Issue: Generation is slow
This is expected for high-quality bulk generation.

Issue: Out of memory error
Reduce batch size in the script (e.g., 100 → 50).

Issue: Need to regenerate codes
Delete qr_codes/ and qr_codes.csv, then rerun the script.
```

---

## 🚧 Future Improvements

- TypeScript support
- Environment-based configuration
- Optional JSON export
- Docker support
- npm CLI distribution

---

## 🤝 Contributing

Pull requests and improvements are welcome.  
Please ensure changes are tested and documented.

---

