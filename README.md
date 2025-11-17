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
  <img width="1891" height="896" alt="Screenshot 2025-11-17 175637" src="https://github.com/user-attachments/assets/99b4ee8c-80b9-45bd-9f6b-7275ce206bd1" />
  <img width="1900" height="906" alt="Screenshot 2025-11-17 175655" src="https://github.com/user-attachments/assets/bc1cd0c7-4b7c-4841-871e-b2f54d71ee9e" />

  <img width="1900" height="909" alt="Atschecker" src="https://github.com/user-attachments/assets/97a640fc-76b7-4f9f-a87c-f32b6183c605" />
  <img width="1899" height="898" alt="resumeopt" src="https://github.com/user-attachments/assets/8a024309-dff0-4fb9-913c-125d15e8065a" />
  <img width="1896" height="908" alt="Interviewprep" src="https://github.com/user-attachments/assets/b8ca8a5e-676f-4ec0-b540-4822e390f973" />

  


  

  

---

## 🧑‍💼 **Recruiter Experience**
- Job management (create, edit, delete)  
- Dashboard with job statistics  
- View applications & shortlisted candidates  
- Access candidate resumes (secure S3 URLs)  
- AI-powered job description generation
  
<img width="1906" height="899" alt="Screenshot 2025-11-17 175547" src="https://github.com/user-attachments/assets/9a114cae-f87d-422e-a89c-600c39028a91" />
<img width="1913" height="904" alt="Screenshot 2025-11-17 180529" src="https://github.com/user-attachments/assets/5ef7696d-5595-44f9-b547-81625e3c2dac" />
<img width="1906" height="905" alt="Screenshot 2025-11-17 180622" src="https://github.com/user-attachments/assets/4c58be0c-626a-413d-a6d6-cad51dc33c77" />



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
- Vercel AI SDK

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

