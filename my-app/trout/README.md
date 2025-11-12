# Estimating Apex - Quality Assurance Checklist

A custom application to check work quality when submitting proposals, ensuring no issues downstream throughout the estimating process.

## Version 1.0.1

## Features

- ✅ Client and location number input
- ✅ Comprehensive checklist (CE, SOW, PA sections)
- ✅ Client-specific conditional logic (e.g., ER costs for Walgreens/Dollar General)
- ✅ Visual progress indicator
- ✅ Notes/logging system with EST timestamps
- ✅ Auto-save/resume functionality (localStorage)
- ✅ Basic metrics tracking (completion time, failed checks)
- ✅ Privacy-focused (not indexed by search engines)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Select Client**: Choose from the dropdown (Costco, Home Depot, Lowes, etc.)
2. **Enter Location Number**: Input the location number for this proposal
3. **Complete Checklist**: Go through each section (CE, SOW, PA) and answer Yes/No
4. **Add Notes**: Use the notes section to log any observations or issues
5. **Track Progress**: Monitor your completion progress via the progress bar
6. **Auto-Save**: Your progress is automatically saved and will resume when you return

## Checklist Sections

### CE – Cost Sheet
- Price validation
- ER/inspection costs (conditional based on client)
- State and tax information
- Sub vs Apex Super
- Equipment mobilization/demobilization
- Concrete job breaker check

### SOW Document
- Date verification
- Content review
- Brand-specific fields
- Formatting check
- Price update verification

### PA Folder
- Folder creation and location verification

## Privacy

This application is configured to:
- Not be indexed by search engines (robots.txt, meta tags)
- Store data locally in browser (localStorage)
- No external tracking or analytics

## Future Enhancements (v1.0.2)

- Password protection
- Earlier workflow steps (Onboarding, SOW Review, CE Development)
- Enhanced validation rules
- Export functionality

## Technology Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Storage**: Browser localStorage

## License

Private - Internal use only

