import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import useSWR, { mutate } from 'swr';

const MatchingInteraction = ({ question, quizAnswers, setQuizAnswers }) => {
  const [shuffledRights, setShuffledRights] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);

  const leftRefs = React.useRef({});
  const rightRefs = React.useRef({});
  const containerRef = React.useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (question.matching_pairs) {
      const rights = question.matching_pairs.map(p => ({ id: p.id || Math.random(), text: p.right }));
      setShuffledRights(rights.sort(() => Math.random() - 0.5));
    }
  }, [question]);

  const handleLeftClick = (id) => {
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (text) => {
    if (selectedLeft !== null) {
      setQuizAnswers(prev => ({
        ...prev,
        [question.id]: {
          ...(prev[question.id] || {}),
          [selectedLeft]: text
        }
      }));
      setSelectedLeft(null);
    }
  };

  const handleRemoveMatch = (leftId) => {
    setQuizAnswers(prev => {
      const currentQAnswers = { ...prev[question.id] };
      delete currentQAnswers[leftId];
      return {
        ...prev,
        [question.id]: currentQAnswers
      };
    });
  };

  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const currentAnswers = quizAnswers[question.id] || {};
      
      const newLines = Object.entries(currentAnswers).map(([leftId, rightText]) => {
        const leftEl = leftRefs.current[leftId];
        const rightItem = shuffledRights.find(r => r.text === rightText);
        const rightEl = rightItem ? rightRefs.current[rightItem.id] : null;

        if (leftEl && rightEl) {
          const lRect = leftEl.getBoundingClientRect();
          const rRect = rightEl.getBoundingClientRect();
          return {
            id: leftId,
            x1: lRect.right - containerRect.left,
            y1: lRect.top + lRect.height / 2 - containerRect.top,
            x2: rRect.left - containerRect.left,
            y2: rRect.top + rRect.height / 2 - containerRect.top,
          };
        }
        return null;
      }).filter(Boolean);
      
      setLines(newLines);
    };

    updateLines();
    const timeout = setTimeout(updateLines, 100);
    window.addEventListener('resize', updateLines);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateLines);
    };
  }, [quizAnswers, question.id, shuffledRights]);

  return (
    <div ref={containerRef} className="relative flex justify-between gap-12 sm:gap-24 w-full my-6 select-none">
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style={{ minHeight: '200px' }}>
        {lines.map(line => (
          <line 
            key={line.id} 
            x1={line.x1} y1={line.y1} 
            x2={line.x2} y2={line.y2} 
            stroke="#3b82f6" strokeWidth="3" 
            markerEnd="url(#arrowhead)"
          />
        ))}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
        </defs>
      </svg>
      
      <div className="flex-1 flex flex-col gap-6 z-20">
        {question.matching_pairs?.map(pair => {
          const pairId = pair.id || pair.left;
          const isMatched = (quizAnswers[question.id] || {})[pairId];
          return (
            <div 
              key={pairId} 
              ref={el => leftRefs.current[pairId] = el}
              onClick={() => handleLeftClick(pairId)}
              className={`p-4 border-2 rounded-lg shadow-sm cursor-pointer transition-all ${selectedLeft === pairId ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200/50 scale-[1.02]' : isMatched ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">{pair.left}</span>
                {isMatched && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveMatch(pairId); }}
                    className="text-xs text-red-500 font-bold hover:underline bg-red-50 px-2 py-1 rounded"
                  >
                    Unmatch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col gap-6 z-20">
        {shuffledRights.map(right => {
          const isMatched = Object.values(quizAnswers[question.id] || {}).includes(right.text);
          return (
            <div 
              key={right.id} 
              ref={el => rightRefs.current[right.id] = el}
              onClick={() => handleRightClick(right.text)}
              className={`p-4 border-2 rounded-lg shadow-sm cursor-pointer transition-all flex items-center ${isMatched ? 'border-green-400 bg-green-50 opacity-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow'} ${selectedLeft !== null && !isMatched ? 'ring-2 ring-blue-300 animate-pulse' : ''}`}
            >
              <span className="font-medium text-slate-700">{right.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TakeQuiz = () => {
  const { id: quizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const trainingClassworkId = searchParams.get('training_classwork');
  const trainingExamId = searchParams.get('training_exam');
  
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [error, setError] = useState(null);
  
  // SWR: Instant loading from cache while revalidating
  const { data: quiz, error: quizError, isLoading: loadingQuiz } = useSWR(
    quizId ? `/api/quizes/${quizId}/` : null,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const submissionUrl = React.useMemo(() => {
    if (!quizId) return null;
    let url = `/api/quizes/${quizId}/my_submission/`;
    const queryParams = new URLSearchParams();
    if (trainingClassworkId) queryParams.append('training_classwork', trainingClassworkId);
    if (trainingExamId) queryParams.append('training_exam', trainingExamId);
    if (queryParams.toString()) url += `?${queryParams.toString()}`;
    return url;
  }, [quizId, trainingClassworkId, trainingExamId]);

  const { data: quizResultData } = useSWR(
    submissionUrl,
    async (url) => {
      try {
        const res = await apiClient.get(url);
        return (res && res.score !== undefined) ? res : null;
      } catch (err) {
        return null;
      }
    },
    { revalidateOnFocus: true }
  );

  const quizResult = localResult || quizResultData;

  useEffect(() => {
    if (quizResultData && quizResultData.answers_data) {
      setQuizAnswers(quizResultData.answers_data);
    }
  }, [quizResultData]);

  const handleSubmitQuiz = async () => {
    try {
      setSubmittingQuiz(true);
      setError(null);
      let url = `/api/quizes/${quizId}/submit_quiz/`;
      const queryParams = new URLSearchParams();
      if (trainingClassworkId) queryParams.append('training_classwork', trainingClassworkId);
      if (trainingExamId) queryParams.append('training_exam', trainingExamId);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      // Optimistic UI update before network confirmation
      const totalMarks = quiz?.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 10;
      const optimisticResult = {
        score: "...",
        total_marks: totalMarks,
        passed: true,
        percentage: 100,
        optimistic: true
      };
      setLocalResult(optimisticResult);
      if (submissionUrl) mutate(submissionUrl, optimisticResult, false);

      const res = await apiClient.post(url, { answers: quizAnswers });
      setLocalResult(res);
      if (submissionUrl) mutate(submissionUrl, res, false);
      setSubmittingQuiz(false);
    } catch (err) {
      setLocalResult(null);
      if (submissionUrl) mutate(submissionUrl);
      setError(err.response?.data?.error || "Failed to submit quiz.");
      setSubmittingQuiz(false);
    }
  };

  if (loadingQuiz && !quiz) return <div className="p-8 text-center font-semibold text-slate-500">Loading quiz...</div>;
  if (error || quizError) return <div className="p-8 text-center text-red-500">{error || "Failed to load the quiz. It may not exist or you do not have permission."}</div>;
  if (!quiz) return <div className="p-8 text-center">Quiz not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-slate-50 min-h-screen">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Training
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{quiz.title || "Assessment Quiz"}</h1>
        <p className="text-slate-600 mb-8">{quiz.description}</p>

        {quizResult && quizResult.score !== undefined ? (
          <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-inner">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Quiz Results</h3>
            <div className="text-6xl font-black mb-4">
              <span className={quizResult.passed ? 'text-green-500' : 'text-red-500'}>
                {quizResult.score}
              </span>
              <span className="text-slate-300">/{quizResult.total_marks}</span>
            </div>
            
            {quizResult.percentage !== undefined && (
              <div className="text-lg font-medium text-slate-600 mb-6">
                Score: {quizResult.percentage.toFixed(1)}% (Required: {quizResult.required_pass_mark || 0}%)
              </div>
            )}
            
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg ${quizResult.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {quizResult.passed ? 'Passed!' : 'Failed'}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {quiz.questions && quiz.questions.length > 0 ? (
              quiz.questions.map((q, index) => (
                <div key={q.id} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-4 mb-6 justify-between">
                    <span className="flex-1">
                      <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold mr-3">
                        {index + 1}
                      </span>
                      <span className="text-xl font-bold text-slate-800">{q.question_text}</span>
                    </span>
                    <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap">{q.marks || 1} Mark(s)</span>
                  </div>
                  
                  {q.question_type === 'MATCHING' ? (
                    <MatchingInteraction question={q} quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} />
                  ) : (
                    <div className="grid gap-3 pl-12">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const optValue = q[`option_${opt.toLowerCase()}`];
                        if (!optValue) return null;
                        return (
                          <label key={opt} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors group ${quizAnswers[q.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input 
                              type="radio" 
                              name={`q_${q.id}`} 
                              value={opt}
                              checked={quizAnswers[q.id] === opt}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span className={`font-medium ${quizAnswers[q.id] === opt ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                              {optValue}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-8">No questions found for this quiz.</div>
            )}

            <div className="pt-6 border-t border-slate-200">
              <button 
                onClick={handleSubmitQuiz}
                disabled={submittingQuiz || (quiz.questions && Object.keys(quizAnswers).length < quiz.questions.length)}
                className={`px-8 py-4 ${submittingQuiz || (quiz.questions && Object.keys(quizAnswers).length < quiz.questions.length) ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-xl shadow-md transition-all text-lg flex items-center justify-center gap-2 w-full`}
              >
                {submittingQuiz ? 'Submitting...' : 'Submit Quiz'} <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
