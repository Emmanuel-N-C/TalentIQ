import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';

export default function InterviewPrep() {
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  const { generateInterviewQuestions, evaluateAnswer, loading } = useAI();

  const handleGenerateQuestions = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    try {
      const generatedQuestions = await generateInterviewQuestions(jobDescription);
      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setFeedback(null);
      toast.success('Questions generated! 🎯');
    } catch (error) {
      toast.error('Failed to generate questions');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    try {
      const result = await evaluateAnswer(
        questions[currentQuestion].question,
        answer
      );
      setFeedback(result);
      toast.success('Feedback received! 📊');
    } catch (error) {
      toast.error('Failed to get feedback');
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setAnswer('');
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">🎤 Interview Practice</h1>
      <p className="text-gray-600 mb-6">
        Practice with AI-powered interview questions and get realistic feedback
      </p>

      {/* Job Description Input */}
      {questions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            Paste Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Paste the job description here to generate relevant interview questions..."
          />
          <button
            onClick={handleGenerateQuestions}
            disabled={loading || !jobDescription.trim()}
            className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '🔄 Generating Questions...' : '✨ Generate Interview Questions'}
          </button>
        </div>
      )}

      {/* Interview Questions */}
      {questions.length > 0 && currentQuestion < questions.length && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                  {questions[currentQuestion].type}
                </span>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  questions[currentQuestion].difficulty === 'hard'
                    ? 'bg-red-100 text-red-800'
                    : questions[currentQuestion].difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {questions[currentQuestion].difficulty}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-gray-800 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full h-40 p-4 border-2 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Type your answer here... Be specific and use examples from your experience."
            disabled={feedback !== null}
          />

          {!feedback && (
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '🔄 Analyzing Your Answer...' : '📊 Get Feedback'}
            </button>
          )}

          {/* AI Feedback */}
          {feedback && (
            <div className="mt-6 space-y-4">
              {/* Score Display */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border-2 border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">Your Score</h3>
                    <p className="text-sm text-gray-600">Based on content, clarity, and relevance</p>
                  </div>
                  <div className="text-5xl font-bold text-primary-600">
                    {feedback.score}<span className="text-2xl text-gray-500">/10</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      feedback.score >= 8
                        ? 'bg-green-600'
                        : feedback.score >= 6
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${(feedback.score / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Strengths */}
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg border-2 border-green-200 p-5">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    What You Did Well
                  </h4>
                  <ul className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-600 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas to Improve */}
              {feedback.improvements && feedback.improvements.length > 0 && (
                <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-5">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {feedback.improvements.map((i, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-orange-600 mr-2 mt-1">▸</span>
                        <span className="text-gray-700">{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-5">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Concrete Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {feedback.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">💡</span>
                        <span className="text-gray-700">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall Feedback */}
              {feedback.overallFeedback && (
                <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-800 mb-2">💬 Overall Feedback</h4>
                  <p className="text-gray-700 leading-relaxed">{feedback.overallFeedback}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentQuestion < questions.length - 1 && (
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Next Question →
                  </button>
                )}

                {currentQuestion === questions.length - 1 && (
                  <div className="flex-1">
                    <div className="text-center mb-3">
                      <p className="text-lg font-semibold text-green-600">
                        🎉 Interview Practice Complete!
                      </p>
                      <p className="text-sm text-gray-600">Great job completing all questions</p>
                    </div>
                    <button
                      onClick={() => {
                        setQuestions([]);
                        setCurrentQuestion(0);
                        setAnswer('');
                        setFeedback(null);
                        setJobDescription('');
                      }}
                      className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
                    >
                      🔄 Start New Practice Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}