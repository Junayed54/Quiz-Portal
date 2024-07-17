import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class Exam(models.Model):
    exam_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    total_questions = models.IntegerField()
    user = models.ForeignKey(User, related_name='exam', on_delete=models.CASCADE, null=True, blank=True)
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

    def __str__(self):
        return f"{self.title}"

    class Meta:
        ordering = ['-created_at']
    
    
    def get_user_attempt_count(self, user):
        # Count how many times a user has taken this exam
        print("this is ", user, ExamAttempt.objects.filter(user=user, exam=self).count())
        return ExamAttempt.objects.filter(user=user, exam=self).count()

class ExamAttempt(models.Model):
    exam = models.ForeignKey(Exam, related_name='attempts', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    total_correct_answers = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - {self.total_correct_answers} correct answers"

class Question(models.Model):
    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    marks = models.IntegerField()

    def get_options(self):
        return self.options.all()

    def __str__(self):
        return self.text

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
