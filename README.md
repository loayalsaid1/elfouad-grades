# El-Fouad Schools Academic Management System

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-94%25-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)

## Project Overview

The El-Fouad Schools Academic Management System is a comprehensive web application built to manage student academic records for El-Fouad Schools in Egypt. The system features a public portal for students and parents to access exam results and a secure administrative dashboard for school staff to manage academic data.

## 📑 Table of Contents

- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Key Features](#-key-features)
  - [Public Student Portal](#public-student-portal)
  - [Administrative Dashboard](#administrative-dashboard)
- [Technical Implementation Details](#-technical-implementation-details)
- [Project Status](#-project-status)
- [Author](#-author)
- [License](#-license)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS with Chadcn custom components
- **State Management**: React Hooks and Context API

### Backend
- **Database & Auth**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Serverless Functions**: Supabase Edge Functions

### Utilities
- **Document Generation**: React PDF
- **Data Processing**: PapaParse for CSV handling

## 🌟 Key Features

### Public Student Portal

#### 🏫 School Selection Interface
- Landing page with dynamic school selection cards
- Support for multiple school branches (El-Fouad Modern Schools and El-Fouad International School)

#### 📚 Grade-Based Navigation
- Intuitive grade selection interface with visual indicators
- Custom routing based on school and grade parameters

#### 📊 Student Results Viewer
- Secure student ID-based search functionality
- Parent password protection for students with parent custody
- Responsive results table with grade indicators
- PDF report generation and download

#### 🗓️ Academic Context Awareness
- Automatic detection of active academic year and term
- Displays appropriate context information based on school and grade

### Administrative Dashboard

#### 🔐 Authentication System
- Role-based access control
- Secure admin authentication flow
- Session management with Supabase Auth

#### 🏫 School Management
- Interface to add, edit, and manage school entities
- Custom slug generation for routing
- School profile management

#### 📤 Results Upload System
- CSV file upload interface with drag-and-drop support
- Data preview with comprehensive validation for the CSV
- Support for marking absent students
- Automatic backup of uploaded CSV files

#### ⚙️ Academic Context Management
- Create and manage academic years, terms, and grades
- Toggle active states for different academic contexts
- Grade-specific settings

#### 🧪 Test Results Interface
- Admin tool to test the student results view
- Context selection (school, grade, year, term)
- Student record editing capabilities

#### 🔄 Data Comparison Tools
- Compare uploaded CSV data with current database records
- Highlight differences between backup and current data
- Export functionality for reconciliation

## 📐 Technical Implementation Details

### ⚡ Performance
- Successfully served over 1,200 concurrent users
- Handled peak loads of 30,000+ backend calls in a single day
- Lightning-fast response times even under heavy load
- Optimized database queries and efficient data fetching

### 🚀 Deployment
- Hosted on Vercel for reliable, scalable performance
- Continuous deployment with GitHub integration
- Edge function deployment via Supabase

### 📄 PDF Report Generation
- Custom-designed student report templates
- Support for Arabic text using specialized fonts
- Dynamic content based on student grade level
- Visual grade indicators and reference charts

### 🔌 API Integration
- Custom RPC functions for both security and fast performance
- Database triggers for automated workflows and data integrity
- Error handling with specific error codes
- Optimized database queries for scale

### 🔄 Data Processing Pipeline
- CSV parsing and validation
- Student record transformation and normalization
- Batch database operations

### 🧭 Dynamic Routing
- Path-based parameters for schools, grades, and students
- SEO-friendly URLs with meaningful paths

### 📱 Responsive Design
- Mobile-first approach using Tailwind's responsive utilities
- Consistent UI across devices with custom breakpoints

### 🔒 Security Features
- Parent password protection for students with parent custody
- Input sanitization and validation
- Role-based access control
- Secure database access patterns

## 📝 Project Status

This project is currently in active use by El-Fouad Schools for managing student academic records. The application is deployed on Vercel, with the public student portal accessible at [elfouadgradesportal.vercel.app](https://elfouadgradesportal.vercel.app).

## 👤 Author

- **Loay Alsaid** - [GitHub](https://github.com/loayalsaid1) | [LinkedIn](https://www.linkedin.com/in/loay-alsaid/)

## 📄 License

MIT License
