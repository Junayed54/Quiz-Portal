import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError


User = get_user_model()



class Exam(models.Model):
    exam_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    total_questions = models.IntegerField()
    questions_to_generate = models.IntegerField(default=0)
    user = models.ForeignKey(User, related_name='exam', on_delete=models.CASCADE, null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='created_by', on_delete=models.CASCADE, null=True, blank=True)
    total_marks = models.IntegerField()
    correct_answers = models.IntegerField(default=0)
    wrong_answers = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    last_date = models.DateField(null=True, blank=True)

    def calculate_pass_fail(self, passing_marks):
        self.passed = self.correct_answers >= passing_marks
        self.save()
        
    def status_id(self):
        print(self.exam__id)
        return self.exam__id

    def __str__(self):
        return f"{self.title}"

    class Meta:
        ordering = ['-created_at']
    
    
    # def save(self, *args, **kwargs):
    #     # Set default value for `questions_to_generate` based on `total_questions`
    #     if self.questions_to_generate == 0:
    #         self.questions_to_generate = self.total_questions
    #     super().save(*args, **kwargs)
    
    def get_user_attempt_count(self, user):
        return ExamAttempt.objects.filter(user=user, exam=self).count()


class Status(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted_to_admin', 'Submitted to Admin'),
        ('under_review', 'Under Review'),
        ('reviewed', 'Reviewed'),
        ('returned_to_creator', 'Returned to Creator'),
        ('published', 'Published'),
    ]
    
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name = 'exam')
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="user")
    # description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name = "reviewed_by")  # Admin who reviewed the exam

    def __str__(self):
        return f"{self.exam.title} - {self.status}"

    def get_exam_details(self):
        """
        This method returns a dictionary containing the exam details needed for the frontend.
        """
        return {
            'title': self.exam.title,
            'created_by': self.exam.created_by.username,  # Assuming 'created_by' is a ForeignKey to User in Exam model
            'total_questions': self.exam.total_questions,
            'total_marks': self.exam.total_marks,
            'last_date': self.exam.last_date,
            'status': self.status,
            'reviewed_by': self.reviewed_by.username if self.reviewed_by else None,
            'user': self.user.username if self.user else None,
        }

class ExamDifficulty(models.Model):
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name='difficulty')
    difficulty1_percentage = models.IntegerField(default=0)  # Difficulty 1 (0-100%)
    difficulty2_percentage = models.IntegerField(default=0)  # Difficulty 2 (0-100%)
    difficulty3_percentage = models.IntegerField(default=0)  # Difficulty 3 (0-100%)
    difficulty4_percentage = models.IntegerField(default=0)  # Difficulty 4 (0-100%)
    difficulty5_percentage = models.IntegerField(default=0)  # Difficulty 5 (0-100%)
    difficulty6_percentage = models.IntegerField(default=0)  # Difficulty 6 (0-100%)

    def clean(self):
        """
        Ensure the sum of the difficulty percentages is 100%.
        """
        total_percentage = (self.difficulty1_percentage + self.difficulty2_percentage +
                            self.difficulty3_percentage + self.difficulty4_percentage +
                            self.difficulty5_percentage + self.difficulty6_percentage)
        if total_percentage != 100:
            raise ValidationError("The total percentage of difficulty questions must equal 100.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Difficulty for {self.exam.title}"

    class Meta:
        verbose_name = 'Exam Difficulty'
        verbose_name_plural = 'Exam Difficulties'



class ExamAttempt(models.Model):
    exam = models.ForeignKey(Exam, related_name='attempts', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    total_correct_answers = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - {self.total_correct_answers} correct answers"

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Question(models.Model):
    DIFFICULTY_LEVEL_CHOICES = [
        (1, 'Very Easy'),
        (2, 'Easy'),
        (3, 'Medium'),
        (4, 'Hard'),
        (5, 'Very Hard'),
        (6, 'Expert'),
    ]
    
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]
    
    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    text = models.CharField(max_length=255, unique=True)
    marks = models.IntegerField()
    category = models.ForeignKey(Category, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL_CHOICES, default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted', null=True)
    remarks = models.TextField(blank=True, null=True)
    time_limit = models.IntegerField(help_text="Time limit for this question in seconds", default=60)
    created_by = models.ForeignKey(User, related_name="question_created_by", null=True, blank=True, on_delete=models.CASCADE)
    reviewed_by = models.ForeignKey(User, related_name="question_reviewed_by", null=True, blank=True, on_delete=models.CASCADE)
    created_at = models.DateField(auto_now_add=True, null=True)
    updated_at = models.DateField(auto_now=True, null=True)
    def get_options(self):
        return self.options.all()

    def __str__(self):
        return self.text

    def category_name(self):
        return self.category.name
    
    
    

    

class QuestionOption(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class Leaderboard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard')
    score = models.IntegerField(default=0)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='leaderboards')

    class Meta:
        ordering = ['-score']  # Order by score descending

    def __str__(self):
        return f'{self.user.username} - {self.score}'

    @staticmethod
    def update_best_score(user, exam):
        # Find the highest score for this user and exam
        best_score = ExamAttempt.objects.filter(user=user, exam=exam).order_by('-total_correct_answers').first()
        
        if best_score:
            leaderboard_entry, created = Leaderboard.objects.get_or_create(user=user, exam=exam)
            if leaderboard_entry.score < best_score.total_correct_answers:
                leaderboard_entry.score = best_score.total_correct_answers
                leaderboard_entry.save()
