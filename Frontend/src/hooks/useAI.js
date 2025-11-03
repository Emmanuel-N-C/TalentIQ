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

  return {
    loading,
    error,
    generateInterviewQuestions,
    evaluateAnswer,
    matchResumeToJob,
  };
}
