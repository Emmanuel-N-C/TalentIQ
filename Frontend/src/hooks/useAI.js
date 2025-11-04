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

  // Helper function to clean and parse JSON from AI response
  const parseAIResponse = (text) => {
    try {
      // Remove markdown code blocks if present
      const cleaned = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Raw text:', text);
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
      console.log(`🤖 Generating interview questions using model: ${groqConfig.modelName}`);
      
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

IMPORTANT: Return ONLY a valid JSON array with NO markdown formatting, NO explanations, just pure JSON:

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
      
      console.log('✅ Received response from Groq');
      const parsed = parseAIResponse(text);
      
      // Handle both array and object with questions property
      const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      
      console.log(`📝 Questions generated: ${questions.length}`);
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
      console.log(`🤖 Evaluating answer using model: ${groqConfig.modelName}`);
      
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

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO explanations:

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
      
      console.log('✅ Received evaluation from Groq');
      const evaluation = parseAIResponse(text);
      
      console.log(`📊 Evaluation score: ${evaluation.score}/10`);
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
      console.log(`🤖 Matching resume to job using model: ${groqConfig.modelName}`);
      
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

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO explanations:

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
      
      console.log('✅ Received match analysis from Groq');
      const matchResult = parseAIResponse(text);
      
      console.log(`📈 Match score: ${matchResult.matchScore}%`);
      return matchResult;
    } catch (err) {
      throw handleAIError(err, 'matchResumeToJob');
    } finally {
      setLoading(false);
    }
  };

  // Analyze resume for ATS scoring (NEW FUNCTION)
  const analyzeResume = async (resumeText) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      console.log(`🤖 Analyzing resume using model: ${groqConfig.modelName}`);
      
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

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO explanations:

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
      
      console.log('✅ Received resume analysis from Groq');
      const analysis = parseAIResponse(text);
      
      console.log(`📊 ATS Score: ${analysis.atsScore}/100`);
      console.log(`🔧 Skills found: ${analysis.skills.length}`);
      return analysis;
    } catch (err) {
      throw handleAIError(err, 'analyzeResume');
    } finally {
      setLoading(false);
    }
  };

  // ... existing code ...

  // NEW: Optimize resume (generic CV improvement, no job required)
  const optimizeResume = async (resumeText) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      console.log(`🤖 Optimizing resume using model: ${groqConfig.modelName}`);
      
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

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO explanations:

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
      
      console.log('✅ Received resume optimization from Groq');
      const optimization = parseAIResponse(text);
      
      console.log(`📊 Quality Score: ${optimization.qualityScore}/100`);
      return optimization;
    } catch (err) {
      throw handleAIError(err, 'optimizeResume');
    } finally {
      setLoading(false);
    }
  };

  // NEW: ATS Checker (job-specific analysis)
  const checkATS = async (resumeText, jobDescription) => {
    setLoading(true);
    setError(null);
    
    try {
      checkGroqConfig();
      console.log(`🤖 Running ATS check using model: ${groqConfig.modelName}`);
      
      const { text } = await generateText({
        model: defaultProviders.analysis,
        prompt: `You are an ATS (Applicant Tracking System) expert. Analyze how well this resume would perform against this specific job's ATS system.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide ATS-specific analysis:
1. ATS Compatibility Score (0-100) - how well the resume passes ATS filters
2. Keyword match analysis
3. Missing critical keywords from job description
4. Formatting issues that might confuse ATS
5. Specific recommendations to improve ATS score for THIS job

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO explanations:

{
  "atsScore": 78,
  "keywordMatchRate": 65,
  "matchedKeywords": ["Python", "Machine Learning", "TensorFlow", "Agile"],
  "missingKeywords": ["Docker", "Kubernetes", "CI/CD", "AWS Lambda"],
  "criticalMissing": ["Docker", "Kubernetes"],
  "formattingIssues": [
    "Tables might not be parsed correctly by ATS",
    "Headers contain complex formatting that ATS may skip"
  ],
  "recommendations": [
    "Add 'Docker' and 'Kubernetes' in skills section if you have experience",
    "Include exact phrases from job description like 'CI/CD pipeline'",
    "Remove table formatting in work experience section",
    "Ensure all dates are in MM/YYYY format",
    "Add a skills section if missing"
  ],
  "alignment": {
    "technical": 75,
    "experience": 80,
    "education": 90,
    "overall": 78
  },
  "summary": "Your resume has a decent ATS compatibility score. The main issue is missing some critical keywords like 'Docker' and 'Kubernetes' that appear frequently in the job description. Adding these (if you have the skills) and removing complex formatting will significantly improve your chances of passing the ATS filter."
}

Analyze now:`,
      });
      
      console.log('✅ Received ATS check from Groq');
      const atsResult = parseAIResponse(text);
      
      console.log(`📊 ATS Score: ${atsResult.atsScore}/100`);
      return atsResult;
    } catch (err) {
      throw handleAIError(err, 'checkATS');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateInterviewQuestions,
    evaluateAnswer,
    matchResumeToJob,
    analyzeResume,
    optimizeResume,  // NEW: Generic resume optimization
    checkATS,        // NEW: Job-specific ATS check
  };
}
