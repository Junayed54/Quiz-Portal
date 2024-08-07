from rest_framework import serializers
from .models import Exam, Question, QuestionOption, Leaderboard, ExamAttempt, Category

class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'is_correct', 'question']

    def create(self, validated_data):
        # Here we ensure that the question is set properly from the validated_data
        return QuestionOption.objects.create(**validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']



class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True)
    exam = serializers.PrimaryKeyRelatedField(queryset=Exam.objects.all(), write_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'marks', 'exam', 'options', 'category']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            QuestionOption.objects.create(question=question, **option_data)
        return question
    
    
    
class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAttempt
        fields = ['exam', 'user', 'total_correct_answers', 'timestamp']

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    user_attempt_count = serializers.SerializerMethodField()
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Exam
        fields = [
            'exam_id', 'title', 'total_questions', 'total_marks', 
            'correct_answers', 'wrong_answers', 'passed', 'created_at', 
            'updated_at', 'last_date', 'questions', 'user_attempt_count', 'created_by'
        ]

    def get_user_attempt_count(self, obj):
        user = self.context['request'].user
        return obj.get_user_attempt_count(user)
    
class LeaderboardSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    exam = serializers.ReadOnlyField(source='exam.title')

    class Meta:
        model = Leaderboard
        fields = ['user', 'exam', 'score']
