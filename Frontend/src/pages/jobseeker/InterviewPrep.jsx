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
      toast.success('Questions generated!');
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
      toast.success('Feedback received!');
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
      <h1 className="text-3xl font-bold mb-6">Interview Practice</h1>

      {/* Job Description Input */}
      {questions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            Paste Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg"
            placeholder="Paste the job description here..."
          />
          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>
      )}

      {/* Interview Questions */}
      {questions.length > 0 && currentQuestion < questions.length && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="ml-4 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {questions[currentQuestion].type}
            </span>
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              {questions[currentQuestion].difficulty}
            </span>
          </div>

          <h2 className="text-xl font-semibold mb-4">
            {questions[currentQuestion].question}
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full h-32 p-3 border rounded-lg mb-4"
            placeholder="Type your answer here..."
            disabled={feedback !== null}
          />

          {!feedback && (
            <button
              onClick={handleSubmitAnswer}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Get Feedback'}
            </button>
          )}

          {/* AI Feedback */}
          {feedback && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">
                Score: {feedback.score}/10
              </h3>
              
              <div className="mb-3">
                <h4 className="font-medium text-green-700">✓ Strengths:</h4>
                <ul className="list-disc list-inside">
                  {feedback.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-orange-700">⚠ Areas to Improve:</h4>
                <ul className="list-disc list-inside">
                  {feedback.improvements.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-blue-700">💡 Suggestions:</h4>
                <ul className="list-disc list-inside">
                  {feedback.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                {feedback.overallFeedback}
              </p>

              {currentQuestion < questions.length - 1 && (
                <button
                  onClick={handleNextQuestion}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Next Question →
                </button>
              )}

              {currentQuestion === questions.length - 1 && (
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-green-600 mb-2">
                    🎉 Interview Complete!
                  </p>
                  <button
                    onClick={() => {
                      setQuestions([]);
                      setCurrentQuestion(0);
                      setAnswer('');
                      setFeedback(null);
                      setJobDescription('');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start New Practice
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}