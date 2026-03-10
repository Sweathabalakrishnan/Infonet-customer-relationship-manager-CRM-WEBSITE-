

# Infonet CRM System

A **full-stack Customer Relationship Management (CRM) application** built for managing broadband sales operations including **lead tracking, L2 feasibility, new connections, reactivations, upselling, and task management** across multiple zones and branches.

This system provides a **role-based dashboard** for administrators, zone managers, branch managers, sales teams, and technicians to manage customer leads and commitments efficiently.

---

# Project Overview

The CRM helps telecom sales teams manage:

* Tech reference leads
* L2 feasibility checks
* New connection commitments
* Customer reactivations
* Upselling opportunities
* Task follow-ups
* Zone / branch level performance

The application includes **dashboard analytics, advanced filtering, dropdown master data, assignment workflows, and Excel export capabilities**.

---

# Tech Stack

## Frontend

* React.js
* Vite
* React Icons
* CSS (custom UI styling)
* Fetch API for backend communication
* XLSX + FileSaver for Excel export

## Backend

* Node.js
* Express.js
* JWT Authentication
* REST API architecture

## Database

* MySQL

---

# System Architecture

```
React Frontend
      │
      │ API Calls
      ▼
Node.js + Express Backend
      │
      │ SQL Queries
      ▼
MySQL Database
```

---

# Core Modules

## 1. Authentication

* Secure login system
* JWT token based authentication
* Role based access control

Roles:

* Admin
* Zone Manager
* Branch Manager
* Sales
* Tech

---

## 2. Dashboard

Provides high-level statistics and charts for:

* Total leads
* L2 feasibility status
* New connections
* Reactivations
* Upsell opportunities
* Pending tasks

---

## 3. Tech Reference Leads

Tracks technician generated customer leads.

Features:

* Lead creation
* Sales follow up tracking
* Assign to sales team
* Zone / branch level filtering

---

## 4. L2 Feasibility

Used to track feasibility verification before connection installation.

Fields include:

* Ticket ID
* Customer details
* Location
* L2 feasibility status
* Order status
* Follow status

---

## 5. New Connection Commitments

Tracks new broadband installations.

Includes:

* Lead ID
* Plan selection
* Connection type
* Payment mode
* Sales user assignment

---

## 6. Reactivation Commitments

Tracks reactivation of disconnected customers.

Features:

* Customer details
* Plan amount
* Activation date
* Follow status
* Zone / branch tracking

---

## 7. Upselling Commitments

Tracks plan upgrades for existing customers.

Includes:

* Current plan
* Upgrade plan
* Payment mode change
* Revenue difference calculation

---

## 8. Task / Follow-up Management

Centralized task management system.

Features:

* Follow-up scheduling
* Module linking (Lead / L2 / Connection / Upsell)
* Task status tracking
* User assignment

---

# Master Data

The system uses master tables for dropdown values:

* Zones
* Branches
* Users
* Plans

These are used across all modules for consistent data management.

---

# Features

### Advanced Filters

All modules support filtering by:

* Zone
* Branch
* Month
* Week
* Assigned user
* Customer name

---

### Excel Export

Users can export module data into Excel files for reporting.

---

### Assign System

Managers can assign records to:

* Sales team
* Technical staff

---

### Edit & Update Records

All modules allow editing existing records safely.

---

### Role Based Access

Different permissions based on user roles.

---

# Database Tables

Key tables used in the system:

```
users
zones
branches
plans
tech_ref_leads
l2_feasibility
new_connection_commitment
reactivation_commitment
upselling_commitment
tasks
```

---

# Installation Guide

## 1. Clone the Repository

```
git clone https://github.com/your-username/infonet-crm.git
```

---

## 2. Backend Setup

```
cd crm-api
npm install
npm run dev
```

Backend runs on:

```
http://localhost:4000
```

---

## 3. Frontend Setup

```
cd crm-frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 4. Database Setup

Import the provided SQL file:

```
crm_db.sql
```

Create database:

```
crm_db
```

---

# Folder Structure

```
infonet-crm
│
├── crm-api
│   ├── src
│   │   ├── modules
│   │   ├── middleware
│   │   ├── routes
│   │   ├── db
│   │   └── server.js
│
├── crm-frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── context
│   │   ├── utils
│   │   └── api
```

---

# Future Improvements

* Chart based analytics dashboard
* Notification system
* Customer search module
* Mobile responsive UI improvements
* Audit logs for record changes

---

# Author

Developed by **SWEATHA SOFTWARE DEVELOPER AT INFONET**

