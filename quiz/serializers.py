from rest_framework import serializers
from .models import Exam, Question, QuestionOption, Leaderboard, ExamAttempt

class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'marks', 'options']

class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAttempt
        fields = ['exam', 'user', 'total_correct_answers', 'timestamp']

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    user_attempt_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = ['exam_id', 'title', 'total_questions', 'total_marks', 'correct_answers', 'wrong_answers', 'passed', 'created_at', 'updated_at', 'last_date', 'questions', 'user_attempt_count']

    
    def get_user_attempt_count(self, obj):
        user = self.context['request'].user
        return obj.get_user_attempt_count(user)
    
    
class LeaderboardSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    exam = serializers.ReadOnlyField(source='exam.title')

    class Meta:
        model = Leaderboard
        fields = ['user', 'exam', 'score']
