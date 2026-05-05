# CarRecalls UK — Premium SaaS Vehicle Intelligence

**CarRecalls UK** is an investor-grade, AI-driven SaaS platform built to transform the raw, government-provided MOT and Recall data into highly actionable, premium intelligence for serious car buyers and dealerships in the UK. 

By leveraging official DVSA endpoints and wrapping them in a proprietary data normalization pipeline, CarRecalls UK surfaces deep vehicle insights—including mileage fraud detection, part failure predictions, and AI-powered negotiation dossiers.

## 🏗 System Architecture

The platform is designed around the **Medallion Data Architecture (Bronze → Silver → Gold)** to ensure high data integrity, reliability, and extreme performance. The backend is built on **Next.js (App Router)** and utilizes an embedded **SQLite** pipeline for lightning-fast localized data transformations.

### 1. The Bronze Layer (Raw Ingestion)
The Bronze layer is responsible for raw data ingestion from external Government APIs. 
*   **MOT History API Integration:** Fetches the raw testing history, dates, odometer readings, and unstructured defect comments.
*   **Recalls Pipeline:** Interfaces with DVSA defect databases to fetch factory safety recalls based on the vehicle's make, model, and build year.
*   **Objective:** Store raw data exactly as received from the government without any mutation. This provides a resilient audit trail and fallback mechanism in case of API deprecations or schema changes.

### 2. The Silver Layer (Transformation & Cleansing)
The Silver layer cleanses, normalizes, and links the unstructured data.
*   **Standardization:** Normalizes DVSA text fields (e.g., standardizing "VW", "VolksWagen", "VOLKSWAGEN" into a unified taxonomy).
*   **Defect Categorization:** Parses raw MOT failure reasons into structured categories (e.g., separating "Braking System" from "Suspension").
*   **Timeline Assembly:** Constructs a chronological timeline of vehicle wear and tear, validating odometer readings to flag potential "clocking" (mileage rollback) anomalies.

### 3. The Gold Layer (Business Intelligence & AI)
The Gold layer provides the proprietary SaaS value, housing the complex business logic, risk heuristics, and AI inferences.
*   **Safety Risk Scoring:** A proprietary algorithm calculates a 0-100 safety score based on the severity of past MOT failures, the frequency of dangerous defects, and outstanding recalls.
*   **AI Intelligence Hub:** Analyzes the Gold data to provide definitive verdicts (**BUY**, **NEGOTIATE**, or **WALK AWAY**). It automatically fails vehicles with expired MOTs or critical unaddressed safety recalls.
*   **Forensic Cost Estimation:** Maps identified defect trends to estimated maintenance costs to warn buyers of impending repair bills.

## 🎨 Frontend & UI/UX

Built using **React** and **Next.js**, the frontend is specifically engineered for high-end SaaS applications, focusing on conversion and premium aesthetics.
*   **Dynamic Theme Engine:** Fully custom CSS variable architecture supporting a cinematic Dark Mode, a high-visibility Light Mode (optimized for outdoor viewing), and a pure black-and-white High Contrast Mode for accessibility.
*   **Color-Blind Safe Visuals:** Avoids traditional problematic red/green dependencies by using WCAG AAA compliant palettes and structured iconographic cues.
*   **Interactive Dashboard:** A responsive, grid-based dashboard that visually groups complex mechanical data into easily digestible metric cards, distribution charts, and chronological timelines.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your DVSA API keys in your environment variables.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔮 Future Roadmap
*   **PostgreSQL Migration:** Transitioning from the local SQLite Medallion pipeline to PostgreSQL for horizontal scalability.
*   **Stripe Integration:** Implementing payment gateways to monetize the premium "Forensic Deep-Dive" reports.
*   **Market Pricing API:** Cross-referencing MOT defect data with real-time used-car market valuations to quantify depreciation accurately.
