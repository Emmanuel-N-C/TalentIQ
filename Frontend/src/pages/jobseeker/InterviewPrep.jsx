import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';
import { Mic, Send, Sparkles, TrendingUp, AlertCircle, Lightbulb, MessageSquare, Target, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

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
      toast.success('Questions generated successfully!');
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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      hard: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
      medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      easy: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
    };
    return colors[difficulty] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Mic className="w-10 h-10 text-purple-400" />
            Interview Practice
          </h1>
          <p className="text-slate-400">
            Practice with AI-powered interview questions and get realistic feedback
          </p>
        </div>

        {/* Job Description Input */}
        {questions.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium mb-3 text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Paste Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-64 p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Paste the job description here to generate relevant interview questions..."
            />
            <button
              onClick={handleGenerateQuestions}
              disabled={loading || !jobDescription.trim()}
              className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? 'Generating Questions...' : 'Generate Interview Questions'}
            </button>
          </div>
        )}

        {/* Interview Questions */}
        {questions.length > 0 && currentQuestion < questions.length && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                    {questions[currentQuestion].type}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-lg font-medium border ${
                    getDifficultyColor(questions[currentQuestion].difficulty).bg
                  } ${getDifficultyColor(questions[currentQuestion].difficulty).text} ${
                    getDifficultyColor(questions[currentQuestion].difficulty).border
                  }`}>
                    {questions[currentQuestion].difficulty}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white leading-relaxed">
                {questions[currentQuestion].question}
              </h2>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-40 p-4 bg-slate-900/50 border border-slate-700 rounded-lg mb-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Type your answer here... Be specific and use examples from your experience."
              disabled={feedback !== null}
            />

            {!feedback && (
              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !answer.trim()}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-all"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Analyzing Your Answer...' : 'Get Feedback'}
              </button>
            )}

            {/* AI Feedback */}
            {feedback && (
              <div className="mt-6 space-y-4">
                {/* Score Display */}
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        Your Score
                      </h3>
                      <p className="text-sm text-slate-400">Based on content, clarity, and relevance</p>
                    </div>
                    <div className="text-5xl font-bold text-purple-400">
                      {feedback.score}<span className="text-2xl text-slate-500">/10</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        feedback.score >= 8
                          ? 'bg-green-500'
                          : feedback.score >= 6
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(feedback.score / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-5">
                    <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      What You Did Well
                    </h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-slate-300">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas to Improve */}
                {feedback.improvements && feedback.improvements.length > 0 && (
                  <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-5">
                    <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {feedback.improvements.map((i, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-orange-400 mr-2 mt-1">▸</span>
                          <span className="text-slate-300">{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {feedback.suggestions && feedback.suggestions.length > 0 && (
                  <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-5">
                    <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Concrete Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {feedback.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start">
                          <Lightbulb className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-slate-300">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Overall Feedback */}
                {feedback.overallFeedback && (
                  <div className="bg-slate-700/50 rounded-xl border border-slate-600 p-5">
                    <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                      Overall Feedback
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{feedback.overallFeedback}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentQuestion < questions.length - 1 && (
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 font-medium transition-all"
                    >
                      Next Question →
                    </button>
                  )}

                  {currentQuestion === questions.length - 1 && (
                    <div className="flex-1">
                      <div className="text-center mb-3">
                        <p className="text-lg font-semibold text-green-400 flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          Interview Practice Complete!
                        </p>
                        <p className="text-sm text-slate-400">Great job completing all questions</p>
                      </div>
                      <button
                        onClick={() => {
                          setQuestions([]);
                          setCurrentQuestion(0);
                          setAnswer('');
                          setFeedback(null);
                          setJobDescription('');
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Start New Practice Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}