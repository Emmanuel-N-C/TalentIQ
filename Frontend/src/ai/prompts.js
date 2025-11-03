export const prompts = {
  // Interview Question Generation
  generateInterviewQuestions: (jobDescription) => `
You are an experienced technical recruiter. Based on the following job description, generate 5 relevant interview questions that would help assess a candidate's fit for this role.

Job Description:
${jobDescription}

Requirements:
- Mix of technical and behavioral questions
- Relevant to the specific role
- Progressive difficulty
- Industry best practices

Return ONLY a JSON array of questions with this structure:
[
  {
    "question": "string",
    "type": "technical|behavioral",
    "difficulty": "easy|medium|hard",
    "category": "string"
  }
]
`,

  // Answer Feedback
  evaluateAnswer: (question, answer) => `
You are an interview coach. Evaluate this candidate's answer:

Question: ${question}

Candidate's Answer: ${answer}

Provide constructive feedback with:
1. Strengths (what was good)
2. Areas for improvement
3. Suggestions for better answers
4. Overall score (1-10)

Be encouraging but honest. Format as JSON:
{
  "score": number,
  "strengths": ["string"],
  "improvements": ["string"],
  "suggestions": ["string"],
  "overallFeedback": "string"
}
`,

  // Resume-Job Matching
  matchResumeToJob: (resumeText, jobDescription) => `
Analyze how well this resume matches the job requirements:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide:
1. Match score (0-100)
2. Matching skills
3. Missing skills
4. Strengths
5. Recommendations

Return as JSON:
{
  "matchScore": number,
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "strengths": ["string"],
  "recommendations": ["string"],
  "summary": "string"
}
`,
};