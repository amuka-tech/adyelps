# Adyel Alumni Network

Welcome to the official web platform for the **Adyel Primary School Alumni Association**. 
Under our slogan **"Connected through time."**, this application serves as the central hub for our alumni to connect, give back to our alma mater, grow professionally, and support each other.

---

## 🌟 Key Features

* **Authentication & RBAC:** Secure Google OAuth and Email authentication with distinct roles (`MEMBER`, `ADMIN`, `SUPER_ADMIN`) using Supabase Auth.
* **Progressive Web App (PWA):** Installable on iOS and Android devices for a native app-like experience with an automatic install prompt.
* **Give Back (Fundraising):** Seamlessly donate to our flagship projects (e.g., Parents' Waiting Pavilion, Sanitary Pads Support, Education Support).
* **News & Events:** Stay updated with school and alumni news. Includes event ticketing with simulated mobile money checkout and QR code generation.
* **Alumni Directory:** Find and connect with fellow members based on graduation year, profession, or location.
* **Welfare:** A dedicated space for obituaries, condolences, and welfare contributions to support members in times of need.
* **Marketplace & Careers:** Discover alumni-owned businesses, post job openings, and request internal referrals.
* **Governance:** Participate in alumni association polls and elections.
* **Mentorship:** Connect with mentors in various professional fields.
* **Mobile-First Dashboards:** A fully responsive, app-like bottom navigation layout for both Users and Super Admins.

---

## 🛠 Technology Stack

* **Framework:** [Next.js](https://nextjs.org/) 16+ (App Router, Server Components, Turbopack)
* **Language:** TypeScript
* **UI/Styling:** React 19, [Tailwind CSS v4](https://tailwindcss.com/), inline SVG Heroicons
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
* **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v20 or higher recommended)
* **Supabase** Project (for Database, Auth, and Storage)

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone <repository_url>
cd obgs
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and configure your Supabase keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Running the Development Server
Start the Next.js development server with Turbopack:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Structure

```
├── public/                 # Static assets (images, icons, PWA manifest)
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts)
│   │   ├── auth/           # OAuth callbacks
│   │   ├── dashboard/      # Protected alumni dashboard pages
│   │   ├── superadmin/     # Super Admin management panel
│   │   └── ...             # Public pages (Home, About, Give Back, etc.)
│   ├── components/         # Reusable React components (UI elements)
│   │   ├── admin/          # Superadmin dashboard components
│   │   └── layout/         # Navbar, Footer, Mobile Menus
│   └── utils/
│       └── supabase/       # Supabase SSR and Client configurations
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Project dependencies and scripts
```

---

## 🔒 Roles & Access

* **MEMBER:** Default role upon registration. Can view directory, RSVP to events, donate, access welfare, and post in the marketplace.
* **ADMIN:** Can manage events, news, welfare updates, and view analytics.
* **SUPER_ADMIN:** Has full control over the platform, including role management, database moderation, system settings, and complete analytics access.

---

## 📄 License
This project is proprietary and built specifically for the Adyel Primary School Alumni Association.
