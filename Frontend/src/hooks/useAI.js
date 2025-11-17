import { useState } from 'react';
import { generateText } from 'ai';
import { defaultProviders, groqConfig } from '../ai/providers';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if Groq is properly configured
  const checkGroqConfig = () => {
    if (!groqConfig.apiKeyConfigured) {
      throw new Error('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.');
    }
    if (!groqConfig.apiKeyValid) {
      throw new Error('Groq API key appears to be invalid. It should start with "gsk_".');
    }
  };

  // Helper function to clean and parse JSON from AI response - IMPROVED
  const parseAIResponse = (text) => {
    try {
      // Remove markdown code blocks if present
      let cleaned = text.trim();
      
      // Remove ```json and ``` markers (but NOT whitespace inside the JSON!)
      cleaned = cleaned.replace(/```json\s*/gi, '');
      cleaned = cleaned.replace(/```\s*$/g, '');
      
      // Remove any leading/trailing whitespace again
      cleaned = cleaned.trim();
      
      // Try to find JSON object or array in the text
      const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      // Parse the JSON
      const parsed = JSON.parse(cleaned);
      
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse AI response. The AI returned invalid JSON.');
    }
  };

  // Handle AI errors gracefully
  const handleAIError = (err, context) => {
    console.error(`❌ Error in ${context}:`, err);
    
    // Check for common error types
    if (err.message?.includes('decommissioned')) {
      const errorMsg = `The AI model has been decommissioned. Please update VITE_GROQ_MODEL in your .env file to a supported model like "llama-3.3-70b-versatile"`;
      console.error(errorMsg);
      setError(errorMsg);
      return new Error(errorMsg);
    }
    
    if (err.message?.includes('API key')) {
      const errorMsg = 'Invalid Groq API key. Please check your VITE_GROQ_API_KEY in .env file.';
      console.error(errorMsg);
      setError(errorMsg);
      return new Error(errorMsg);
    }
    
    if (err.message?.includes('rate limit')) {
      const errorMsg = 'Groq API rate limit exceeded. Please wait a moment and try again.';
      console.error(errorMsg);
      setError(errorMsg);
      return new Error(errorMsg);
    }
    
    setError(err.message);
    return err;
  };

  // Generate interview questions
  const generateInterviewQuestions = async (jobDescription) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.interview,
        prompt: `You are an expert technical interviewer. Generate exactly 5 relevant interview questions for the following job description.

Job Description:
${jobDescription}

Requirements:
- Mix of technical and behavioral questions
- Appropriate difficulty levels
- Relevant to the specific role
- Clear and professional

CRITICAL: Return ONLY a valid JSON array. NO markdown, NO code blocks, NO explanations. Just the raw JSON array:

[
  {
    "question": "What is your experience with...",
    "type": "technical",
    "difficulty": "medium",
    "category": "Technical Skills"
  },
  {
    "question": "Describe a time when...",
    "type": "behavioral",
    "difficulty": "easy",
    "category": "Soft Skills"
  }
]

Generate the 5 questions now:`,
      });
      
      const parsed = parseAIResponse(text);
      
      // Handle both array and object with questions property
      const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      
      return questions;
    } catch (err) {
      throw handleAIError(err, 'generateInterviewQuestions');
    } finally {
      setLoading(false);
    }
  };

  // Evaluate answer
  const evaluateAnswer = async (question, answer) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.interview,
        prompt: `You are an experienced interview coach. Evaluate the candidate's answer to the following interview question.

Interview Question:
${question}

Candidate's Answer:
${answer}

Provide constructive, detailed feedback with:
1. A score from 1-10
2. Specific strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Actionable suggestions (2-3 points)
5. Overall encouraging feedback

CRITICAL: Return ONLY valid JSON. NO markdown, NO code blocks, NO explanations:

{
  "score": 7,
  "strengths": [
    "Clear communication",
    "Good technical understanding"
  ],
  "improvements": [
    "Could provide more specific examples",
    "Add quantifiable results"
  ],
  "suggestions": [
    "Use the STAR method for behavioral questions",
    "Include metrics when discussing achievements"
  ],
  "overallFeedback": "Good answer overall. You demonstrated solid understanding of the topic. To improve, consider adding more specific examples from your experience and quantifying your impact where possible."
}

Evaluate now:`,
      });
      
      const evaluation = parseAIResponse(text);
      
      return evaluation;
    } catch (err) {
      throw handleAIError(err, 'evaluateAnswer');
    } finally {
      setLoading(false);
    }
  };

  // Match resume to job
  const matchResumeToJob = async (resumeText, jobDescription) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.matching,
        prompt: `You are an expert recruiter and resume analyst. Analyze how well this resume matches the job requirements.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide a comprehensive analysis including:
1. Match score (0-100)
2. Matching skills found in resume
3. Skills required but missing from resume
4. Candidate's key strengths for this role
5. Specific recommendations to improve fit
6. Overall summary

CRITICAL: Return ONLY valid JSON. NO markdown, NO code blocks, NO explanations:

{
  "matchScore": 75,
  "matchingSkills": [
    "React",
    "TypeScript",
    "REST APIs"
  ],
  "missingSkills": [
    "GraphQL",
    "Docker"
  ],
  "strengths": [
    "5+ years React experience",
    "Led team of 4 developers",
    "Built scalable applications"
  ],
  "recommendations": [
    "Highlight system design experience more prominently",
    "Add specific metrics for team leadership impact",
    "Consider obtaining Docker certification"
  ],
  "summary": "Strong candidate with solid React and TypeScript experience. Great leadership background. Would benefit from gaining GraphQL and containerization experience to be a perfect fit."
}

Analyze now:`,
      });
      
      const matchResult = parseAIResponse(text);
      
      return matchResult;
    } catch (err) {
      throw handleAIError(err, 'matchResumeToJob');
    } finally {
      setLoading(false);
    }
  };

  // Analyze resume for ATS scoring
  const analyzeResume = async (resumeText) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.analysis,
        prompt: `You are an ATS (Applicant Tracking System) expert and resume analyst. Analyze this resume comprehensively.

RESUME TEXT:
${resumeText}

Provide a detailed analysis including:
1. ATS Score (0-100) - how well the resume would perform in ATS systems
2. All technical and soft skills extracted from the resume
3. Key strengths of this resume
4. Areas that need improvement
5. Specific actionable recommendations
6. Overall professional summary

Consider:
- Keyword density and relevance
- Formatting and structure
- Quantifiable achievements
- Missing important sections
- ATS-friendly formatting
- Industry-standard terminology

CRITICAL: Return ONLY valid JSON. NO markdown, NO code blocks, NO explanations:

{
  "atsScore": 75,
  "skills": ["JavaScript", "React", "Node.js", "AWS", "Agile", "Team Leadership"],
  "strengths": [
    "Strong technical background with 5+ years experience",
    "Clear quantifiable achievements with metrics",
    "Well-formatted and easy to read",
    "Includes relevant certifications"
  ],
  "improvements": [
    "Missing keywords like 'CI/CD' and 'DevOps'",
    "Education section could be more prominent",
    "No professional summary at the top",
    "Some bullet points lack quantifiable metrics"
  ],
  "recommendations": [
    "Add a professional summary highlighting key strengths",
    "Include 'CI/CD', 'Docker', and 'Kubernetes' if you have experience",
    "Move education section higher if recent graduate",
    "Add links to GitHub, LinkedIn, or portfolio",
    "Use more action verbs: 'Led', 'Developed', 'Optimized', 'Implemented'",
    "Quantify all achievements with numbers or percentages"
  ],
  "summary": "Solid resume with good technical content and relevant experience. Main areas for improvement are adding more industry-standard keywords for ATS optimization and including quantifiable metrics in all achievement statements. The formatting is clean, which is excellent for ATS parsing. Consider adding a professional summary to quickly highlight your value proposition."
}

Analyze now:`,
      });
      
      const analysis = parseAIResponse(text);
      
      return analysis;
    } catch (err) {
      throw handleAIError(err, 'analyzeResume');
    } finally {
      setLoading(false);
    }
  };

  // Optimize resume (generic CV improvement, no job required)
  const optimizeResume = async (resumeText) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.analysis,
        prompt: `You are a professional resume writer and career coach. Analyze this resume and provide actionable advice to improve it overall.

RESUME TEXT:
${resumeText}

Focus on:
1. Overall quality score (0-100)
2. Formatting and structure
3. Content clarity and impact
4. What sections to add/improve/remove
5. Writing style and action verbs
6. Quantifiable achievements
7. Professional presentation

CRITICAL: Return ONLY valid JSON. NO markdown, NO code blocks, NO explanations:

{
  "qualityScore": 75,
  "detectedSkills": ["JavaScript", "React", "Node.js", "AWS"],
  "strengths": [
    "Clear work history with dates",
    "Good use of action verbs",
    "Includes relevant certifications"
  ],
  "weaknesses": [
    "Missing professional summary section",
    "Some bullet points lack quantifiable results",
    "Education section needs more details"
  ],
  "recommendations": [
    "Add a compelling professional summary at the top (3-4 lines)",
    "Quantify achievements with numbers (e.g., 'Increased sales by 30%')",
    "Add links to LinkedIn, GitHub, or portfolio",
    "Use consistent bullet point formatting throughout",
    "Remove outdated skills like Flash or IE6 support"
  ],
  "sectionsToAdd": [
    "Professional Summary",
    "Key Achievements section",
    "Volunteer Experience (if relevant)"
  ],
  "sectionsToRemove": [
    "References (use 'available upon request' instead)",
    "Hobbies (unless directly relevant to job)"
  ],
  "formattingTips": [
    "Use consistent date formatting (MM/YYYY)",
    "Ensure margins are at least 0.5 inches",
    "Use standard fonts like Arial, Calibri, or Times New Roman",
    "Keep to 1-2 pages maximum"
  ],
  "summary": "Your resume has a solid foundation with clear work history and relevant skills. To take it to the next level, focus on adding quantifiable achievements and a compelling professional summary. The structure is good, but some sections need refinement for maximum impact."
}

Analyze now:`,
      });
      
      const optimization = parseAIResponse(text);
      
      return optimization;
    } catch (err) {
      throw handleAIError(err, 'optimizeResume');
    } finally {
      setLoading(false);
    }
  };

  // ATS Checker (job-specific analysis) - FIXED JSON PARSING
  const checkATS = async (resumeText, jobDescription) => {
    setLoading(true);
    setError(null);

    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.analysis,
        prompt: `You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume against the job description and provide a detailed compatibility report.

Resume:
${resumeText}

Job Description:
${jobDescription}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON
2. NO markdown code blocks (no \`\`\`json or \`\`\`)
3. NO explanations before or after the JSON
4. Just the raw JSON object starting with { and ending with }

Provide your analysis in this exact JSON format:

{
  "score": 75,
  "atsScore": 75,
  "keywordMatchRate": 68,
  "matchedKeywords": ["React", "JavaScript", "Node.js", "AWS", "Agile", "Team Leadership"],
  "missingKeywords": ["Docker", "Kubernetes", "GraphQL", "CI/CD", "Microservices"],
  "recommendedKeywords": ["TypeScript", "REST APIs", "Git", "Jest", "Redux"],
  "strengths": [
    "Strong React and JavaScript experience (5+ years)",
    "Demonstrated leadership with quantifiable results",
    "Relevant cloud computing experience with AWS",
    "Good use of action verbs throughout"
  ],
  "weaknesses": [
    "Missing several key technologies mentioned in job description",
    "Limited DevOps experience shown",
    "No mention of testing frameworks",
    "Lacks specific project metrics in some areas"
  ],
  "optimizationTips": [
    "Add Docker and Kubernetes if you have any containerization experience",
    "Highlight any CI/CD pipeline work you've done",
    "Include specific metrics for all major achievements (percentages, numbers, time saved)",
    "Add a technical skills section prominently near the top",
    "Use exact keywords from the job description where truthful",
    "Reorganize experience to put most relevant projects first"
  ],
  "overallFeedback": "Your resume shows strong foundational skills that align well with this role, particularly in React and JavaScript development. However, to maximize your ATS score, you should incorporate more of the specific technologies mentioned in the job description. The overall structure is good, but adding quantifiable metrics and technical keywords will significantly improve your chances of passing ATS filters.",
  "actionableSteps": [
    "Review your past projects and add any experience with Docker, Kubernetes, or CI/CD tools",
    "Quantify every achievement with specific numbers (e.g., 'Improved performance by 40%')",
    "Add a 'Technical Skills' section at the top with all relevant technologies",
    "Mirror the job description's language for skills you genuinely possess",
    "Ensure all required qualifications are explicitly addressed somewhere in your resume",
    "Have someone review for spelling/grammar - ATS systems penalize errors"
  ]
}

Focus on:
1. Skills and technical keywords matching
2. Years of experience alignment
3. Education requirements
4. Soft skills mentioned in job description
5. Industry-specific terminology
6. Action verbs and quantifiable achievements
7. ATS-friendly formatting

Be specific, actionable, and honest in your recommendations. Only suggest adding keywords for skills the candidate likely has based on their experience.

Return the JSON now:`,
      });
      
      const result = parseAIResponse(text);
      
      // Ensure both score and atsScore are set
      if (!result.score && result.atsScore) {
        result.score = result.atsScore;
      } else if (result.score && !result.atsScore) {
        result.atsScore = result.score;
      }
      
      return result;
    } catch (err) {
      console.error('Full error details:', err);
      throw handleAIError(err, 'checkATS');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI job description
  const generateJobDescription = async (title, company, experienceLevel = 'Mid-Level') => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.interview,
        prompt: `You are an expert recruiter and technical writer. Generate a professional, detailed job description for the following position:

Job Title: ${title}
Company: ${company}
Experience Level: ${experienceLevel}

Create a comprehensive job description that includes:
1. A compelling overview (2-3 sentences)
2. Key responsibilities (5-7 bullet points)
3. Required qualifications (4-6 bullet points)
4. Preferred qualifications (2-3 bullet points)
5. What makes this opportunity exciting

CRITICAL: Return ONLY valid JSON. NO markdown, NO code blocks, NO explanations:

{
  "description": "A full, well-formatted job description as a single string with line breaks (\\n) separating sections. Include section headers like 'About the Role:', 'Responsibilities:', 'Required Qualifications:', etc.",
  "suggestedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}

Generate now:`,
      });
      
      const result = parseAIResponse(text);
      
      return result;
    } catch (err) {
      throw handleAIError(err, 'generateJobDescription');
    } finally {
      setLoading(false);
    }
  };

  // ✨ NEW: Generate Cover Letter
  const generateCoverLetter = async (jobTitle, companyName, jobDescription, resumeText, userName = 'Candidate') => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      
      const { text } = await generateText({
        model: defaultProviders.analysis,
        prompt: `You are a professional career coach and cover letter expert. Write a compelling, personalized cover letter for this job application.

Job Title: ${jobTitle}
Company: ${companyName}
Applicant Name: ${userName}

JOB DESCRIPTION:
${jobDescription}

APPLICANT'S RESUME/BACKGROUND:
${resumeText}

Write a cover letter that:
1. Is 250-350 words (not too short, not too long)
2. Shows genuine enthusiasm for the role and company
3. Highlights 2-3 specific relevant experiences from the resume
4. Connects the applicant's skills to the job requirements
5. Demonstrates knowledge of what the company/role needs
6. Sounds professional but authentic, not overly formal or robotic
7. Includes specific examples, not generic statements
8. Has a strong opening and confident closing

IMPORTANT RULES:
- DO use first person ("I", "my") 
- DO be specific about skills and experiences
- DO connect resume experiences to job requirements
- DON'T use placeholder text like [Your Name] or [Company]
- DON'T be overly flattering or use clichés
- DON'T make up experiences not in the resume
- DON'T sound like it was written by AI (avoid "I am writing to express my interest")

Structure:
- Opening: Hook that shows you understand the role
- Body (2-3 paragraphs): Relevant experiences and skills
- Closing: Confident call to action

CRITICAL: Return ONLY valid JSON. NO markdown, NO code blocks, NO explanations:

{
  "coverLetter": "The complete cover letter text as a single string. Use \\n\\n for paragraph breaks. Do NOT include 'Dear Hiring Manager' or signature - just the body paragraphs.",
  "highlights": [
    "Key point 1 mentioned in the letter",
    "Key point 2 mentioned in the letter",
    "Key point 3 mentioned in the letter"
  ],
  "tone": "professional",
  "wordCount": 320
}

Generate now:`,
      });
      
      const result = parseAIResponse(text);
      
      return result;
    } catch (err) {
      throw handleAIError(err, 'generateCoverLetter');
    } finally {
      setLoading(false);
    }
  };

  return {
    generateInterviewQuestions,
    evaluateAnswer,
    matchResumeToJob,
    analyzeResume,
    optimizeResume,
    checkATS,
    generateJobDescription,
    generateCoverLetter,
    loading,
    error,
  };
}