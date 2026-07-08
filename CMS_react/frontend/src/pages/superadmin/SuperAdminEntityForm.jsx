import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminConfig } from '../../config/adminConfig';
import CourseForm from '../admin/forms/CourseForm';
import LessonForm from '../admin/forms/LessonForm';
import ModuleForm from '../admin/forms/ModuleForm';
import QuizForm from '../admin/forms/QuizForm';
import QuizQuestionForm from '../admin/forms/QuizQuestionForm';
import GenericForm from '../admin/forms/GenericForm';
import PartnerForm from '../admin/forms/PartnerForm';
import SiteSettingForm from '../admin/forms/SiteSettingForm';
import TrainingForm from '../admin/forms/TrainingForm';
import ClassworkForm from '../admin/forms/ClassworkForm';
import ExamForm from '../admin/forms/ExamForm';
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
    case 'partners':
      return <PartnerForm isEditing={isEditing} partnerId={isEditing ? id : null} />;
    case 'site_settings':
      return <SiteSettingForm isEditing={isEditing} settingId={isEditing ? id : null} />;
    case 'trainings':
      return <TrainingForm isEditing={isEditing} trainingId={isEditing ? id : null} />;
    case 'classwork':
      return <ClassworkForm isEditing={isEditing} classworkId={isEditing ? id : null} />;
    case 'exams':
      return <ExamForm isEditing={isEditing} examId={isEditing ? id : null} />;
    default:
      return <GenericForm entityId={entityId} itemId={isEditing ? id : null} isEditing={isEditing} />;
  }
};

export default SuperAdminEntityForm;
