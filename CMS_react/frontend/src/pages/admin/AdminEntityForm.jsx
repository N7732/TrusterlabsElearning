import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CourseForm from './forms/CourseForm';
import ModuleForm from './forms/ModuleForm';
import LessonForm from './forms/LessonForm';
import QuizForm from './forms/QuizForm';
import QuizQuestionForm from './forms/QuizQuestionForm';
import GenericForm from './forms/GenericForm';
import PartnerForm from './forms/PartnerForm';
import SiteSettingForm from './forms/SiteSettingForm';
import TrainingForm from './forms/TrainingForm';
import ClassworkForm from './forms/ClassworkForm';
import ExamForm from './forms/ExamForm';

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
    case 'partners':
      return <PartnerForm isEditing={isEditing} partnerId={entityId} />;
    case 'site_settings':
      return <SiteSettingForm isEditing={isEditing} settingId={entityId} />;
    case 'trainings':
      return <TrainingForm isEditing={isEditing} trainingId={entityId} />;
    case 'classwork':
      return <ClassworkForm isEditing={isEditing} classworkId={entityId} />;
    case 'exams':
      return <ExamForm isEditing={isEditing} examId={entityId} />;
    default:
      return <GenericForm entityId={entity} itemId={entityId} isEditing={isEditing} />;
  }
};

export default AdminEntityForm;
