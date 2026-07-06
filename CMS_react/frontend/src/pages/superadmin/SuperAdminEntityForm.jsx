import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminConfig } from '../../config/adminConfig';
import CourseForm from '../admin/forms/CourseForm';
import LessonForm from '../admin/forms/LessonForm';
import ModuleForm from '../admin/forms/ModuleForm';
import QuizForm from '../admin/forms/QuizForm';
import QuizQuestionForm from '../admin/forms/QuizQuestionForm';
// For entities without custom forms, we could render a generic fallback
// import GenericForm from './GenericForm';

const SuperAdminEntityForm = () => {
  const { entityId, id } = useParams();
  const navigate = useNavigate();
  const config = adminConfig[entityId];

  if (!config) {
    return <div>Entity not found.</div>;
  }

  const isEditing = id !== 'new';

  // Route to specific forms based on entity
  switch (entityId) {
    case 'courses':
      return <CourseForm isEditing={isEditing} courseId={isEditing ? id : null} />;
    case 'modules':
      return <ModuleForm isEditing={isEditing} moduleId={isEditing ? id : null} />;
    case 'lessons':
      return <LessonForm isEditing={isEditing} lessonId={isEditing ? id : null} />;
    case 'quizzes':
      return <QuizForm isEditing={isEditing} quizId={isEditing ? id : null} />;
    case 'quiz_questions':
      return <QuizQuestionForm isEditing={isEditing} questionId={isEditing ? id : null} />;
    default:
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Edit {config.label}</h2>
          <p className="text-slate-500 mb-6">Custom form for {entityId} is under construction.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300"
          >
            Go Back
          </button>
        </div>
      );
  }
};

export default SuperAdminEntityForm;
