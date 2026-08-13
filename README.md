# Lira Town College Class of 2016 Alumni Network

Welcome to the official web platform for the **Lira Town College (LTC) Class of 2016 Alumni Association**. 
Under our slogan **"Aged to Perfection since 2016"**, this application serves as the central hub for our alumni to connect, give back to our alma mater, and grow together.

## 🌟 Key Features

* **Authentication & RBAC:** Secure JWT-based authentication with distinct roles (`MEMBER`, `ADMIN`, `SUPER_ADMIN`).
* **Give Back (Fundraising):** Seamlessly donate to our flagship projects (e.g., Parents' Waiting Pavilion, Sanitary Pads Support, Education Support).
* **News & Events:** Stay updated with school and alumni news. Includes event ticketing with simulated mobile money checkout and QR code generation.
* **Alumni Directory:** Find and connect with fellow Class of 2016 members.
* **Welfare:** A dedicated space for obituaries, condolences, and welfare contributions.
* **Marketplace & Careers:** Discover alumni-owned businesses, post job openings, and request internal referrals.
* **Governance:** Participate in alumni association polls and elections.
* **Mentorship:** Connect with mentors in various professional fields.

## 🛠️ Technology Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router, Version 16+)
* **UI/Styling:** React 19, [Tailwind CSS v4](https://tailwindcss.com/)
* **Database:** MySQL (interfaced via `mysql2`)
* **Security/Auth:** Supabase Auth
* **Utilities:** `qrcode.react`, `html5-qrcode`

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MySQL** Server (running locally on default port `3306`)

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone <repository_url>
cd AdyelPS
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and configure your database and JWT secret:
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=adyeldb

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Initialization
Ensure your MySQL server is running and you have created a database named `adyeldb`. 
You can initialize the database schema and seed dummy data using the provided scripts in the `scripts/` directory:

```bash
# Example: Running the main seed script
node scripts/seed_all.js

# Note: You can explore other scripts like `setup_rbac.js`, `setup_events.js`, or `rebrand_projects.js` depending on your testing needs.
```

### 4. Running the Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 📁 Project Structure

```
├── public/                 # Static assets (images, icons)
├── scripts/                # Database migration, setup, and seeding scripts
├── src/
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── api/            # Backend API endpoints (Auth, Events, Projects, etc.)
│   │   ├── dashboard/      # Protected alumni dashboard pages
│   │   └── ...             # Public pages (Home, About, Give Back, etc.)
│   ├── components/         # Reusable React components (UI elements, Layouts)
│   └── lib/                # Shared utilities (Database connection, JWT helpers)
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## 👥 Roles & Access

* **MEMBER:** Default role upon registration. Can view directory, RSVP to events, donate, and post in the marketplace.
* **ADMIN:** Can manage events, news, welfare updates, and view analytics.
* **SUPER_ADMIN:** Has full control over the platform, including role management and system settings.

*(To create an admin account for testing, you can run the `scripts/create_superadmin.js` script.)*

## 📝 License
This project is proprietary and built specifically for the Lira Town College Class of 2016 Alumni Association.
