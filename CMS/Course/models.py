from unittest.util import _MAX_LENGTH
from django.db import models
from django.utils.text import slugify

class Course(models.Model):
    Difficulty_Choices = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]
    Course_Status_choice=[
        ("published", "Published"),
        ("draft", "Draft"),
        ("unpublished", "Unpublished")
    ]
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150,unique=True, blank=True)
    description = models.TextField()
    course_status = models.CharField(max_length=40,choices=Course_Status_choice, default="draft")
    is_locked = models.BooleanField(default=False, help_text="If true, the course content is locked and cannot be accessed by learners.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    thumbnail_url = models.URLField(max_length=1000, blank=True, null=True, help_text="Direct link to course thumbnail (e.g., Cloudinary)")

    #Difficult level of Course
    difficulty = models.CharField(max_length=20, choices=Difficulty_Choices, default='Beginner')

    #Course Prices
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True) 
    current_Choice =[
        ("USD", "USD"),
        ("EUR", "EUR"),
        ("Rwf", "Rwf"),
    ]
    current = models.CharField(max_length=10, choices=current_Choice, default="USD")    

    #Instructor who Created/Owns This Course
    instructor = models.ForeignKey('Auth.Instructor', on_delete=models.CASCADE, related_name='courses', null=True, blank=True)
    
    # Certification Settings
    has_certificate = models.BooleanField(default=False, help_text="If true, learners will receive a certificate upon completion.")
    auto_issue_certificate = models.BooleanField(default=False, help_text="If true, certificates are issued automatically upon completion. Otherwise, wait for Admin/Instructor to issue manually.")
    certificate_duration = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., '1.5-Hour'")
    certificate_type_text = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 'Online Cybersecurity Workshop'")
    certificate_program_title = models.CharField(max_length=200, blank=True, null=True, help_text="e.g., 'SSL/TLS: Securing Communication on the Internet'")
    certificate_description = models.TextField(blank=True, null=True, help_text="e.g., 'This workshop covered SSL/TLS fundamentals...'")
    
    #Prequesites
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'

    def __str__(self):
        return f"{self.title} {self.difficulty}"
    
    #This Logic is For Generate Slug Automatically When Course is Created Even if Many Courses have same Name
    def save(self, *args, **kwargs):
        self.clean()
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()


class CourseResource(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=150)
    file = models.FileField(upload_to='course_resources/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Course Resource'
        verbose_name_plural = 'Course Resources'

    def __str__(self):
        return f"{self.title} ({self.course.title})"

#Course of Prequestites allow to specifyiing Minimum marks
class CoursePrerequisite(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='prerequisites')
    prerequisite_course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='required_for')
    minimum_marks = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        unique_together = ('course', 'prerequisite_course')
        verbose_name = 'Course Prerequisite'
        verbose_name_plural = 'Course Prerequisites'

    def __str__(self):
        return f"{self.prerequisite_course.title} is a prerequisite for {self.course.title} with minimum marks {self.minimum_marks}"
    
#Class Module This is Under Courses 
class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Module'
        verbose_name_plural = 'Modules'

    def __str__(self):
        return f"{self.title} (Course: {self.course.title})"
    
class Lesson(models.Model):
    Text = "text"
    Video = "video"
    code = "Code"
    Lesson_type_Choices = [
        (Text, "Text"),
        (Video, "Video"),
        (code, "Code"),
    ]
    module=models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=150)
    lesson_type = models.CharField(max_length=10, choices=Lesson_type_Choices, default=Text)
    content =models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    video_file = models.FileField(upload_to='lesson_videos/', blank=True, null=True)
    code_template = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'

    def __str__(self):
        return f"{self.title} (Module: {self.module.title})"
    
    @property
    def media_type(self):
        """ 
        Determine the media type based on the video URL or file.
        Return: 
            str: The media type ('youtube', 'vimeo', 'google_drive', 'video_file', or 'unknown').
        """
        if self.video_file:
            return "video_file"
            
        if not self.video_url:
            return "unknown"
        url = self.video_url.lower()

        #Prioritize known Service

        if "youtube.com" in url or "youtu.be" in url:
            return "youtube"
        elif "vimeo.com" in url:
            return "vimeo"
        elif "drive.google.com" in url:
            return "google_drive"
        
        #Check extensions anywhere in URL(handles query params)
        if any(ext in url for ext in [".jpg", ".jpeg", ".png", ".gif"]):
            return "image"
        if any(ext in url for ext in [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"]):
            return "video_file"
        return "unknown"
    
    @property
    def embed_url(self):
        """"
        Transform the URL into an embeddable format based on the media type. 
        Return:
            str: The embeddable URL or None if the media type is unknown.
        """

        if not self.video_url:
            return ""
        
        url = self.video_url
        if self.media_type == "youtube":
            if "watch?v=" in url:
                return url.replace("watch?v=", "embed/")
            elif "youtu.be/" in url:
                return url.replace("youtu.be/", "www.youtube.com/embed/")
        elif self.media_type == "drive":
            if "/view" in url:
                return url.replace("/view", "/preview")
            elif "/sharing" in url:
                return url.replace("/sharing", "/preview")
        return url
    

class Quizes(models.Model):
    # Lesson link kept for backward compatibility, but it's better to link quizzes to modules or courses directly.
    lesson = models.ForeignKey(Lesson, related_name="quizzes", on_delete=models.CASCADE, null=True, blank=True)
    module = models.ForeignKey(Module, related_name="quizzes", on_delete=models.CASCADE, null=True, blank=True)
    course = models.ForeignKey(Course, related_name="Exams", on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=150, default="Quiz")
    description = models.TextField(blank=True, null=True, help_text="Instruction for the Quiz/Exams")

    #Renamed "Question" to "Description" effecctively but keeping field if migration is hard
    #Actually, let's keep question field as a legacy "Intro text" if needed or map it.
    #The user didn't ask to delete fields. Let's assume "question" field was the intro text for the quiz, and "description" is the instruction. We can keep both for now.

    question = models.TextField(blank=True, null=True, help_text="Intro text for the Quiz/Exams")
    pass_mark = models.PositiveIntegerField(default=70, help_text="Percentage required to pass (e.g., 70 for 70%)")
    max_attempts = models.PositiveIntegerField(default=1, help_text="Maximum number of attempts allowed for this quiz/exam.")
    time_limit = models.PositiveIntegerField(help_text="Time limit in minutes for the quiz/exam. Set to 0 for no time limit.", default=0)
    order = models.PositiveBigIntegerField(default=0, help_text="Order of the quiz/exam in the module/course.")
    is_locked = models.BooleanField(default=False, help_text="If true, the quiz/exam is locked and cannot be attempted.")
    is_published = models.BooleanField(default=False, help_text="If false, the quiz/exam will not be visible to learners.")

    class Meta:
        ordering = ['order']
        verbose_name = "Quiz/Exam"
        verbose_name_plural = "Quizzes/Exams"

    def __str__(self):
        if self.course:
            return f"Exam: {self.title} (Course: {self.course.title})"
        elif self.module:
            return f"Quiz: {self.title} (Module: {self.module.title})"
        elif self.lesson:
            return f"Quiz: {self.title} (Lesson: {self.lesson.title})"
        return f"Quiz: {self.title}"
    
    @property
    def type(self):
        if self.course: return "Exam"
        if self.module: return "Module Quiz"
        return "Lesson Quiz"

class QuizQuestion(models.Model):
    QUESTION_TYPES = [
        ('MULTIPLE_CHOICE', 'Multiple Choice'),
        ('MATCHING', 'Matching'),
    ]

    quiz = models.ForeignKey(Quizes, related_name="questions", on_delete=models.CASCADE)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='MULTIPLE_CHOICE')
    question_text = models.TextField()

    # Answer Options for Multiple Choice Questions
    option_a = models.CharField(max_length=100, null=True, blank=True)
    option_b = models.CharField(max_length=100, null=True, blank=True)
    option_c = models.CharField(max_length=100, null=True, blank=True)
    option_d = models.CharField(max_length=100, null=True, blank=True)

    correct_option = models.CharField(max_length=1, choices=[
        ('A','Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D'),
    ], null=True, blank=True)

    # For Matching Questions
    matching_pairs = models.JSONField(null=True, blank=True, help_text="Stored as [{'id': 1, 'left': '...', 'right': '...'}, ...]")

    order = models.PositiveBigIntegerField(default=0)
    marks = models.PositiveIntegerField(default=1, help_text="Marks awarded for this question")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question for Quiz: {self.quiz.title}"
    
class QuizSubmission(models.Model):
    learner = models.ForeignKey('Auth.Learner', related_name='quiz_submissions', on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quizes, related_name='submissions', on_delete=models.CASCADE)
    score = models.PositiveIntegerField(default=0)
    total_marks = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    answers_data = models.JSONField(null=True, blank=True, help_text="Stored answers submitted by the learner")
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = "Quiz Submission"
        verbose_name_plural = "Quiz Submissions"

    def __str__(self):
        return f"{self.learner} - {self.quiz.title} - Score: {self.score}/{self.total_marks}"

class Enrollment(models.Model):
    status = models.CharField (max_length=20, choices=[
        ('active', 'Active'),
        ('pending', 'Pending Approval'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ], default='active')

    learner = models.ForeignKey('Auth.Learner', related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Final grade/Score object")

    class Meta:
        unique_together = ('learner', 'course')
        ordering = ['-enrolled_at']
        verbose_name = 'Enrollment'
        verbose_name_plural ='Enrollments'

    def __str__(self):
        return f"{self.course.title}"
    

class LessonProgress(models.Model):
    learner = models.ForeignKey('Auth.Learner', related_name='lesson_progress', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='progress', on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('learner', 'lesson')
        verbose_name = "Lesson Progress"
        verbose_name_plural = "Lesson Progress"

    def __str__(self):
        return f"{self.learner} - {self.lesson} - {'Completed' if self.is_completed else 'In Progress'}"

class ReuseRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    CONTENT_TYPE_CHOICES = [
        ('course', 'Course'),
        ('module', 'Module'),
        ('lesson', 'Lesson'),
        ('training', 'Training'),
        ('classwork', 'Training Classwork'),
        ('exam', 'Training Exam'),
    ]
    
    requester = models.ForeignKey('Auth.Instructor', on_delete=models.CASCADE, related_name='reuse_requests_made')
    owner = models.ForeignKey('Auth.Instructor', on_delete=models.CASCADE, related_name='reuse_requests_received', null=True, blank=True)
    content_type = models.CharField(max_length=50, choices=CONTENT_TYPE_CHOICES)
    object_id = models.IntegerField(help_text="ID of the entity being requested")
    destination_id = models.IntegerField(null=True, blank=True, help_text="ID of the destination course, module, or training")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Reuse Request"
        verbose_name_plural = "Reuse Requests"

    def __str__(self):
        return f"{self.requester} requesting {self.content_type} {self.object_id} - {self.status}"
