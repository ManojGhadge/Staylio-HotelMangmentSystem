# Staylio Admin Dashboard

A premium, modern admin dashboard for managing the Staylio platform.

## Features

- 🎨 **Premium UI Design** - Modern, clean interface with smooth animations
- 🔐 **Secure Authentication** - Protected routes and secure login
- 📊 **Dashboard Analytics** - Real-time statistics and insights
- 👥 **User Management** - Manage platform users
- 🏨 **Host Management** - Approve and manage hosts
- 🏢 **Hotel Management** - Oversee all hotel listings
- 📈 **Analytics** - Platform performance metrics
- ⚙️ **Settings** - Configure platform settings
- 🌈 **Animated Background** - Smooth gradient animations
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Axios

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Login Credentials

**Username:** `admin`  
**Password:** `admin@123`

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with sidebar
│   └── ProtectedRoute.jsx  # Route protection
├── contexts/
│   └── AuthContext.jsx     # Authentication context
├── pages/
│   ├── LoginPage.jsx       # Login page
│   ├── DashboardPage.jsx   # Main dashboard
│   ├── HostsManagementPage.jsx
│   ├── UsersManagementPage.jsx
│   ├── HotelsManagementPage.jsx
│   ├── AnalyticsPage.jsx
│   └── SettingsPage.jsx
├── App.jsx                 # Main app component
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## Features Overview

### Dashboard
- Real-time statistics
- Activity feed
- Quick actions
- Performance metrics

### Host Management
- View all hosts
- Approve/reject registrations
- Filter by status
- Search functionality

### Responsive Design
- Mobile-friendly sidebar
- Adaptive layouts
- Touch-optimized controls

## Notes

- This is the **Admin Dashboard** - separate from the Host Dashboard
- Hosts cannot access admin pages
- All routes are protected and require authentication
- The UI features smooth animations and modern design patterns
