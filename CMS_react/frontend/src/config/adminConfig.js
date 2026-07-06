export const adminConfig = {
  learners: {
    label: 'Learners',
    endpoint: '/auth/api/learners/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'email', label: 'Email' },
      { field: 'phone_number', label: 'Phone' },
    ],
    canCreate: false,
    canEdit: false,
    canDelete: true,
  },
  instructors: {
    label: 'Instructors',
    endpoint: '/auth/api/instructors/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'specialization', label: 'Specialization' },
      { field: 'is_approved', label: 'Approved' },
    ],
    canCreate: false,
    canEdit: true,
    canDelete: true,
  },
  courses: {
    label: 'Courses',
    endpoint: '/api/courses/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'title', label: 'Title' },
      { field: 'difficulty', label: 'Difficulty' },
      { field: 'is_published', label: 'Published' },
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  modules: {
    label: 'Modules',
    endpoint: '/api/modules/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'title', label: 'Title' },
      { field: 'order', label: 'Order' },
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  lessons: {
    label: 'Lessons',
    endpoint: '/api/lessons/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'title', label: 'Title' },
      { field: 'lesson_type', label: 'Type' },
      { field: 'is_published', label: 'Published' },
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  quizzes: {
    label: 'Quizzes / Exams',
    endpoint: '/api/quizes/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'title', label: 'Title' },
      { field: 'max_attempts', label: 'Max Attempts' },
      { field: 'is_locked', label: 'Locked' },
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  quiz_questions: {
    label: 'Quiz Questions',
    endpoint: '/api/quiz_questions/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'quiz', label: 'Quiz ID' },
      { field: 'question_text', label: 'Question' },
      { field: 'correct_option', label: 'Correct Answer' },
    ],
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  enquiries: {
    label: 'Student Enquiries',
    endpoint: '/enquiry/',
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'user_name', label: 'User' },
      { field: 'email', label: 'Email' },
      { field: 'course_title', label: 'Course' },
      { field: 'status', label: 'Status' },
    ],
    canCreate: false,
    canEdit: false,
    canDelete: true,
    customActions: [
      {
        label: 'Enroll',
        actionType: 'api',
        apiEndpoint: (id) => `/enquiry/${id}/enroll_student/`,
        method: 'POST',
        showIf: (item) => item.status === 'pending'
      }
    ]
  }
};
