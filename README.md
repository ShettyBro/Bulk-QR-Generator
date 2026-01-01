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
  totalCodes: 8000, // Total unique codes to generate
  prefix: 'Prefix',// Code prefix
  codeLength: 8, // Total length of the code including prefix
  imageSize: 600, // QR code image size in pixels
  imageFormat: 'png', // Image file format
  errorCorrectionLevel: 'H', // High error correction (30%)
  outputFolder: 'qr_codes', // Output folder for QR code images
  csvFile: 'qr_codes.csv' // Output CSV file name
};

```

---

## 📈 Performance Characteristics

| Metric | Typical Value |
|------|--------------|
| Generation Speed | 500–800 codes/min |
| Memory Usage | ~200–300 MB |
| Image Size | ~10–20 KB per QR |

---

## 🛠️ Troubleshooting

```
Issue: "Cannot find module 'qrcode'"
Solution: Run npm install first

Issue: Generation is slow
Normal! Generating 8,000 high-quality QR codes takes 10-15 minutes.

Issue: Out of memory error
Solution: The script processes in batches of 100 to avoid memory issues. If still happening, reduce batchSize in the code from 100 to 50.

Issue: Need to regenerate codes
Solution:
        Delete qr_codes/ folder and qr_codes.csv
        Run script again
        New random codes will be generated
```

---
