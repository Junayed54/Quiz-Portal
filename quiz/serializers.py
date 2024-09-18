from rest_framework import serializers
from .models import Exam, Status, ExamDifficulty, Question, QuestionOption, Leaderboard, ExamAttempt, Category
# from users.models import User
from django.contrib.auth import get_user_model
User = get_user_model()
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
        fields = ['id', 'name', 'description', 'reviewed_by']



class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True)
    exam = serializers.PrimaryKeyRelatedField(queryset=Exam.objects.all(), write_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    category_name = serializers.SerializerMethodField()

    created_by_name = serializers.StringRelatedField(read_only=True)  # Use username or any identifier as per your requirement
    reviewed_by = serializers.StringRelatedField(read_only=True) 
    class Meta:
        model = Question
        fields = ['id', 'text', 'marks', 'exam', 'options', 'status', 'remarks', 'category', 'created_by', 'category_name', 'difficulty_level',  'time_limit', 'reviewed_by', 'updated_at', 'created_at', 'created_by_name']
        
    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.exam and obj.created_by else None
       
    def get_category_name(self, obj):
        return obj.category.name if obj.category and obj.category.name else None
    
    # def get_created_at(self, obj):
    #     return obj.exam.created_at if obj.exam and obj.exam.created_at else None
    

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            QuestionOption.objects.create(question=question, **option_data)
        return question


  

class ExamAttemptSerializer(serializers.ModelSerializer):
    exam_title = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamAttempt
        fields = ['exam', 'exam_title', 'user', 'total_correct_answers', 'timestamp']

    def get_exam_title(self, obj):
        return obj.exam.title
    
    
class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    user_attempt_count = serializers.SerializerMethodField()
    created_by = serializers.ReadOnlyField(source='created_by.username')
    status_id = serializers.SerializerMethodField()
    class Meta:
        model = Exam
        fields = [
            'exam_id', 'title', 'total_questions', 'questions_to_generate', 'total_marks', 
            'correct_answers', 'wrong_answers', 'passed', 'created_at', 
            'updated_at', 'last_date', 'questions', 'user_attempt_count', 'created_by', 'status_id'
        ]

    def get_user_attempt_count(self, obj):
        user = self.context['request'].user
        return obj.get_user_attempt_count(user)

    def get_status_id(self, obj):
        # Access the status_id through the related Status model
        return obj.exam.id if obj.exam.status else None 

class StatusSerializer(serializers.ModelSerializer):
    exam_details = serializers.SerializerMethodField()

    class Meta:
        model = Status
        fields = ['id', 'exam', 'user', 'status', 'reviewed_by', 'exam_details']

    def get_exam_details(self, obj):
        return obj.get_exam_details()

class ExamDifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamDifficulty
        fields = [
            'exam',
            'difficulty1_percentage',
            'difficulty2_percentage',
            'difficulty3_percentage',
            'difficulty4_percentage',
            'difficulty5_percentage',
            'difficulty6_percentage',
        ]
    
    def validate(self, data):
        """
        Ensure that the sum of the difficulty percentages is equal to 100%.
        """
        total_percentage = (data['difficulty1_percentage'] +
                            data['difficulty2_percentage'] +
                            data['difficulty3_percentage'] +
                            data['difficulty4_percentage'] +
                            data['difficulty5_percentage'] +
                            data['difficulty6_percentage'])
        if total_percentage != 100:
            raise serializers.ValidationError("The total percentage of difficulty questions must equal 100%.")
        return data



    
class LeaderboardSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    exam = serializers.ReadOnlyField(source='exam.title')

    class Meta:
        model = Leaderboard
        fields = ['user', 'exam', 'score']
