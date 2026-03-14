# 🏨 Staylio - Hotel Booking Platform

A comprehensive hotel booking platform with separate dashboards for users, hosts, and administrators.

## 📋 Project Structure

```
StayLio/
├── staylio/                    # User Dashboard (React + Vite)
├── staylio-admin-dashboard/    # Admin Dashboard (React + Vite)
├── staylio-host-dashboard/     # Host Dashboard (React + Vite)
├── staylio-backend/            # Backend API (Spring Boot)
├── setup-admin-database.sql    # Admin setup SQL
├── setup-hotel-claiming.sql    # Hotel claiming system SQL
└── setup-payment-integration.sql # Payment system SQL
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Java 17 or higher
- MySQL 8.0 or higher
- Maven

### 1. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE staylio_db;
exit;

# Run setup scripts
mysql -u root -p staylio_db < setup-admin-database.sql
mysql -u root -p staylio_db < setup-hotel-claiming.sql
mysql -u root -p staylio_db < setup-payment-integration.sql
```

### 2. Backend Setup

```bash
cd staylio-backend
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 3. User Dashboard Setup

```bash
cd staylio
npm install
npm run dev
```

User Dashboard runs on: `http://localhost:5173`

### 4. Admin Dashboard Setup

```bash
cd staylio-admin-dashboard
npm install
npm run dev
```

Admin Dashboard runs on: `http://localhost:5174`

### 5. Host Dashboard Setup

```bash
cd staylio-host-dashboard
npm install
npm run dev
```

Host Dashboard runs on: `http://localhost:5175`

## 🔑 Default Credentials

### Admin Login
- Email: `admin@staylio.com`
- Password: `admin123`

### Test User
- Create account via User Dashboard

### Test Host
- Create account via Host Dashboard
- Requires admin approval

## ✨ Features

### User Dashboard
- Browse and search hotels
- View hotel details with images
- Book hotels with online payment (Razorpay)
- Pay at hotel option
- User authentication

### Admin Dashboard
- Manage hotels
- Approve/reject host registrations
- Approve/reject hotel claims
- View all bookings
- User management

### Host Dashboard
- Claim existing hotels
- View claimed hotels
- Manage hotel details
- View bookings for owned hotels

## 💳 Payment Integration

The platform uses Razorpay for online payments.

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/26`)

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router

### Backend
- Spring Boot 3
- Spring Data JPA
- MySQL
- Maven

### Payment
- Razorpay

## 📁 Important Files

### SQL Setup Files
- `setup-admin-database.sql` - Creates admin user and tables
- `setup-hotel-claiming.sql` - Sets up hotel claiming system
- `setup-payment-integration.sql` - Adds payment fields to bookings

### Configuration Files
- `staylio-backend/src/main/resources/application.properties` - Backend config
- Database connection settings
- Server port configuration

## 🔧 Configuration

### Database Configuration
Edit `staylio-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/staylio_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### API Endpoints
All dashboards connect to: `http://localhost:8080/api`

## 📝 Common Tasks

### Add New Hotels
1. Login to Admin Dashboard
2. Navigate to Hotels section
3. Click "Add Hotel"
4. Fill in details and save

### Approve Host Registration
1. Login to Admin Dashboard
2. Navigate to Hosts section
3. Review pending hosts
4. Click "Approve" or "Reject"

### Approve Hotel Claims
1. Login to Admin Dashboard
2. Navigate to Hotel Claims
3. Review pending claims
4. Click "Approve" to assign hotel to host

### Make a Booking
1. Browse hotels in User Dashboard
2. Click on a hotel
3. Click "Book Now"
4. Fill in booking details
5. Choose payment method
6. Complete booking

## 🐛 Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify database credentials in `application.properties`
- Ensure port 8080 is not in use

### Frontend won't start
- Run `npm install` in the dashboard directory
- Check if ports 5173, 5174, 5175 are available
- Clear node_modules and reinstall if needed

### Payment not working
- Verify Razorpay test key in `RazorpayPayment.jsx`
- Check browser console for errors
- Ensure backend is running

### Hotel claim approval fails
- Run SQL: `UPDATE hotels SET hotel_owner_id = NULL WHERE id = X;`
- Verify hotel has required fields (address, city, country)
- Check backend logs for specific error

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Verify database schema
4. Ensure all services are running

## 🎯 Development Workflow

1. Start MySQL database
2. Start backend: `cd staylio-backend && mvn spring-boot:run`
3. Start user dashboard: `cd staylio && npm run dev`
4. Start admin dashboard: `cd staylio-admin-dashboard && npm run dev`
5. Start host dashboard: `cd staylio-host-dashboard && npm run dev`

## 📦 Build for Production

### Backend
```bash
cd staylio-backend
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend Dashboards
```bash
# User Dashboard
cd staylio
npm run build

# Admin Dashboard
cd staylio-admin-dashboard
npm run build

# Host Dashboard
cd staylio-host-dashboard
npm run build
```

## 🔐 Security Notes

- Change default admin password in production
- Use environment variables for sensitive data
- Replace Razorpay test key with live key for production
- Enable HTTPS in production
- Implement proper authentication and authorization

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ using React, Spring Boot, and MySQL**
