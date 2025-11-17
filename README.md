# 🧠 TalentIQ  
**AI-Powered Recruitment Platform**

TalentIQ is a full-stack recruitment platform that connects **job seekers**, **recruiters**, and **admins** with smart dashboards, resume tools, job management, and AI-powered hiring assistance.

It features **role-based dashboards**, **resume management**, **ATS scanning**, **resume optimization**, **AI job descriptions**, **interview prep**, and more — powered by **React + Vite**, **Spring Boot**, **PostgreSQL**, **AWS S3**, and **Groq LLMs**.

---

## 🚀 Features

### 🔐 **Role-Based Access**
- Job Seeker, Recruiter, and Admin dashboards  
- Protected routes using JWT + Spring Security  
- Dynamic navigation and role-based permissions  

---

## 👤 **Job Seeker Experience**
- Personalized dashboard  
- Browse & search jobs (basic and advanced filters)  
- Save jobs and track applications  
- Resume upload, parsing, and text extraction  
- Profile management (password, avatar, info)  
- Interview prep and career tools powered by AI  

---

## 🧑‍💼 **Recruiter Experience**
- Job management (create, edit, delete)  
- Dashboard with job statistics  
- View applications & shortlisted candidates  
- Access candidate resumes (secure S3 URLs)  
- AI-powered job description generation  

---

## 🛠️ **Admin Experience**
- Platform-level dashboards  
- User management  
- Job management (system-wide)  

---

## 🤖 **AI-Powered Tools (Groq LLM)**
- **Resume Analyzer** – feedback & improvement tips  
- **Resume Optimizer** – ATS-focused enhancements  
- **ATS Checker** – ATS compatibility scoring  
- **Interview Prep** – custom Q&A and coaching  
- Centralized Groq model provider (`@ai-sdk/groq`)  
- Uses models like `llama-3.3-70b-versatile`, `mixtral`, etc.

---

## 📄 **Resume Parsing & Storage**
- Resume uploads (PDF, DOCX, etc.)  
- Extraction using **Apache Tika**  
- Metadata + text stored in PostgreSQL  
- Secure file hosting via **AWS S3** with signed URLs  

---

## 📧 **Email & Notifications**
- OTP Verification  
- Password reset links  
- Email delivery via **SendGrid**  
- Frontend toasts via `react-hot-toast`  

---

## 🧰 Tech Stack

### **Frontend**
- React 19 + Vite  
- React Router DOM 7  
- Tailwind CSS  
- React Query (TanStack)  
- React Hook Form + Zod  
- Axios  
- Google OAuth (`@react-oauth/google`)  
- Groq AI (`@ai-sdk/groq` and `ai`)

### **Backend**
- Spring Boot 3  
- Spring Security (JWT, OAuth2)  
- PostgreSQL + Hibernate  
- AWS SDK v2 (S3)  
- Apache Tika  
- SendGrid  
- Maven  

### **Infrastructure**
- Vercel (Frontend)  
- Railway (Backend)  
- AWS S3 for file storage  


## 🤝 Contributing

Contributions welcome!

1. Fork the repo  
2. Create a feature branch  
3. Commit changes with clear messages  
4. Submit a Pull Request  

---

