# 🎓 Naija GPA Pro
### *The Ultra-Modern GPA & CGPA Statement Generator*

**Naija GPA Pro** is a high-performance, web-based tool designed specifically for students in Nigerian tertiary institutions. It combines a high-end "Glassmorphic" UI with precise academic computation logic to allow students to calculate, save, and export professional grade statements.

---

## 🚀 Live Application
**URL:** [https://naija-gpa-pro.vercel.app](https://naija-gpa-pro.vercel.app)

---

## ✨ Key Features

* **Dual Grading Systems:** Supports both **5.0 CGPA** (Standard University) and **4.0 CGPA** (Polytechnic/Technical) scales.
* **Persistent Storage:** Uses **LocalStorage** to ensure records remain on the user's device even without a backend connection or internet access.
* **Professional PDF Export:** A custom-engineered "Statement of Results" generator that bypasses modern CSS rendering bugs to provide a clean, printable document.
* **Real-time Computation:** Instant CGPA updates as grades and units are entered—no page refreshes required.
* **Always-On Strategy:** Integrated with **Cron-job.org** to prevent "Cold Starts" on the Vercel edge network, ensuring sub-second load times.

---

## 🛠️ Technical Stack

* **Framework:** React (Vite, Typescript)
* **Styling:** Tailwind CSS (Optimized for High-DPI screens)
* **PDF Engine:** html2canvas & jsPDF
* **Infrastructure:** Vercel (Deployment) & GitHub (Version Control)
* **Reliability:** Cron-job.org (Keep-alive monitoring)

---

## 📐 Grading Logic (Nigerian University Standard)

The system is calibrated to the following weightings:

| Grade | 5.0 Scale | 4.0 Scale | Result |
| :--- | :--- | :--- | :--- |
| **A** | 5.0 | 4.0 | Excellent |
| **B** | 4.0 | 3.0 | Very Good |
| **C** | 3.0 | 2.0 | Good |
| **D** | 2.0 | 1.0 | Pass |
| **E** | 1.0 | 0.0 | Fair |
| **F** | 0.0 | 0.0 | Fail |

---

## 🛡️ Technical Problem Solving (Dev Logs)

### 1. The "oklab" Rendering Conflict
**Problem:** The PDF library (`html2canvas`) crashed when encountering modern CSS `oklab()` and `oklch()` color functions.

**Solution:** Implemented a DOM-cloning strategy via the `onclone` hook to strip and replace high-definition colors with standard HEX/RGB during the capture process.

### 2. Infrastructure Resilience
**Problem:** Google Cloud billing restrictions blocked Firestore initialization.

**Solution:** Pivoted to a **Local-First** architecture, prioritizing user data persistence in the browser to ensure 100% uptime.

---

 *Project built by Okafor Emmanuel Chukwuemeka*
