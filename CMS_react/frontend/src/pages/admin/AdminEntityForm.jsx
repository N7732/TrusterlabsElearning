import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CourseForm from './forms/CourseForm';
import ModuleForm from './forms/ModuleForm';
import LessonForm from './forms/LessonForm';
import QuizForm from './forms/QuizForm';
import QuizQuestionForm from './forms/QuizQuestionForm';

const AdminEntityForm = () => {
  const { entity, id } = useParams();
  
  const isEditing = id !== 'new' && id !== undefined;
  const entityId = isEditing ? id : null;

  switch (entity) {
    case 'courses':
      return <CourseForm isEditing={isEditing} courseId={entityId} />;
    case 'modules':
      return <ModuleForm isEditing={isEditing} moduleId={entityId} />;
    case 'lessons':
      return <LessonForm isEditing={isEditing} lessonId={entityId} />;
    case 'quizzes':
      return <QuizForm isEditing={isEditing} quizId={entityId} />;
    case 'quiz_questions':
      return <QuizQuestionForm isEditing={isEditing} questionId={entityId} />;
    default:
      // For entities we haven't built explicit forms for yet (like learners, instructors, enrollments)
      return (
        <div className="p-8 text-center text-slate-500">
          <h2 className="text-xl font-bold mb-2">Form not available</h2>
          <p>The form to edit {entity} has not been implemented yet.</p>
        </div>
      );
  }
};

export default AdminEntityForm;
