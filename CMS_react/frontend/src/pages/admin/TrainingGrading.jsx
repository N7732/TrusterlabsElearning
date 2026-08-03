import React, { useState, useEffect } from 'react';

const TrainingGrading = ({ trainingId, token }) => {
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingScores, setGradingScores] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch all grades and submissions for a training
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetch(`https://api.yourdomain.com/training/trainings/${trainingId}/grades/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load training grades');
        const data = await res.json();
        setTrainingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [trainingId, token]);

  // Handle score input change
  const handleScoreChange = (type, assignmentId, participantId, value) => {
    setGradingScores({
      ...gradingScores,
      [`${type}-${assignmentId}-${participantId}`]: value
    });
  };

  // Submit a grade for a classwork or exam
  const submitGrade = async (type, assignmentId, participantId, currentScore) => {
    const key = `${type}-${assignmentId}-${participantId}`;
    const newScore = gradingScores[key];
    
    if (newScore === undefined || newScore === '') return;

    setSaving(true);
    try {
      const endpoint = type === 'classwork' 
        ? `https://api.yourdomain.com/training/classwork/${assignmentId}/submissions/`
        : `https://api.yourdomain.com/training/exams/${assignmentId}/submissions/`;

      // NOTE: In a real scenario, you'd fetch the submission ID first, or the backend 
      // can be adjusted to accept participant_id instead of submission_id.
      // Assuming your backend `manage_submissions` takes `submission_id` and `score`:
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          participant_id: participantId, // Ensure backend handles participant_id for grading
          score: newScore 
        })
      });

      if (!res.ok) throw new Error('Failed to save score');
      
      // Update local state
      const updatedData = { ...trainingData };
      const pIndex = updatedData.participants.findIndex(p => p.user_id === participantId);
      if (pIndex > -1) {
        if (type === 'classwork') {
          updatedData.participants[pIndex].classwork_scores[assignmentId] = parseFloat(newScore);
        } else {
          updatedData.participants[pIndex].exam_scores[assignmentId] = parseFloat(newScore);
        }
      }
      setTrainingData(updatedData);
      
      // Clear input
      const updatedScores = { ...gradingScores };
      delete updatedScores[key];
      setGradingScores(updatedScores);

      alert('Grade saved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading grades...</div>;
  if (error) return <div className="text-red-500 p-8 text-center">{error?.message || (typeof error === 'string' ? error : 'Failed to load data')}</div>;
  if (!trainingData) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Training Grading Dashboard</h2>
        <div className="flex gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-md">
            <p className="text-sm text-gray-500">Class Average</p>
            <p className="text-xl font-bold text-blue-600">{trainingData.analysis.average}%</p>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-md">
            <p className="text-sm text-gray-500">Graded Students</p>
            <p className="text-xl font-bold text-green-600">{trainingData.analysis.graded_participants} / {trainingData.analysis.total_participants}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">Participant</th>
              {trainingData.courses && trainingData.courses.map(tc => (
                <th key={`tc-${tc.id}`} className="p-3 border text-center">Course: {tc.title}</th>
              ))}
              {trainingData.classworks.map(cw => (
                <th key={`cw-${cw.id}`} className="p-3 border text-center">Classwork: {cw.title}</th>
              ))}
              {trainingData.exams.map(ex => (
                <th key={`ex-${ex.id}`} className="p-3 border text-center">Exam: {ex.title}</th>
              ))}
              <th className="p-3 border text-center">Overall Average</th>
            </tr>
          </thead>
          <tbody>
            {trainingData.participants.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 border">
                  <p className="font-semibold text-gray-800">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </td>
                
                {/* Course Grading Cells */}
                {trainingData.courses && trainingData.courses.map(tc => (
                  <td key={`tc-cell-${tc.id}`} className="p-3 border text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`font-bold ${p.course_scores[tc.id] !== null && p.course_scores[tc.id] !== undefined ? 'text-blue-600' : 'text-gray-400'}`}>
                        {p.course_scores[tc.id] !== null && p.course_scores[tc.id] !== undefined ? `${p.course_scores[tc.id]}%` : 'Incomplete'}
                      </span>
                    </div>
                  </td>
                ))}
                
                {/* Classwork Grading Cells */}
                {trainingData.classworks.map(cw => (
                  <td key={`cw-cell-${cw.id}`} className="p-3 border text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`font-bold ${p.classwork_scores[cw.id] !== undefined ? 'text-green-600' : 'text-gray-400'}`}>
                        {p.classwork_scores[cw.id] !== undefined ? `${p.classwork_scores[cw.id]}%` : 'Not Graded'}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="number" 
                          placeholder="Score"
                          className="w-20 p-1 border rounded text-center text-sm"
                          value={gradingScores[`classwork-${cw.id}-${p.user_id}`] || ''}
                          onChange={(e) => handleScoreChange('classwork', cw.id, p.user_id, e.target.value)}
                        />
                        <button 
                          disabled={saving}
                          onClick={() => submitGrade('classwork', cw.id, p.user_id, p.classwork_scores[cw.id])}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </td>
                ))}

                {/* Exam Grading Cells */}
                {trainingData.exams.map(ex => (
                  <td key={`ex-cell-${ex.id}`} className="p-3 border text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`font-bold ${p.exam_scores[ex.id] !== undefined ? 'text-purple-600' : 'text-gray-400'}`}>
                        {p.exam_scores[ex.id] !== undefined ? `${p.exam_scores[ex.id]}%` : 'Not Graded'}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="number" 
                          placeholder="Score"
                          className="w-20 p-1 border rounded text-center text-sm"
                          value={gradingScores[`exam-${ex.id}-${p.user_id}`] || ''}
                          onChange={(e) => handleScoreChange('exam', ex.id, p.user_id, e.target.value)}
                        />
                        <button 
                          disabled={saving}
                          onClick={() => submitGrade('exam', ex.id, p.user_id, p.exam_scores[ex.id])}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </td>
                ))}

                <td className="p-3 border text-center font-bold text-gray-800">
                  {p.average ? `${p.average}%` : '-'}
                </td>
              </tr>
            ))}
            
            {trainingData.participants.length === 0 && (
              <tr>
                <td colSpan={2 + trainingData.classworks.length + trainingData.exams.length + (trainingData.courses ? trainingData.courses.length : 0)} className="p-8 text-center text-gray-500">
                  No admitted participants found in this training.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainingGrading;
