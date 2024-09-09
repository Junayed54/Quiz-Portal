# # yourapp/admin.py
# from django.contrib import admin
# from .models import Exam, Question, QuestionOption

# @admin.register(Exam)
# class ExamAdmin(admin.ModelAdmin):
#     list_display = ('exam_id', 'title', 'user', 'total_questions', 'total_marks', 'correct_answers', 'wrong_answers', 'passed', 'start_time', 'end_time', 'given_exam_date', 'last_date')
#     list_filter = ('passed', 'given_exam_date', 'last_date')
#     search_fields = ('title', 'user__username', 'exam_id')

# @admin.register(Question)
# class QuestionAdmin(admin.ModelAdmin):
#     list_display = ('text', 'exam', 'marks')
#     list_filter = ('exam',)
#     search_fields = ('text', 'exam__title')

# @admin.register(QuestionOption)
# class QuestionOptionAdmin(admin.ModelAdmin):
#     list_display = ('text', 'question', 'is_correct')
#     list_filter = ('question__exam', 'is_correct')
#     search_fields = ('text', 'question__text')


from django.contrib import admin
from .models import Exam, Question, QuestionOption, ExamAttempt, Leaderboard, Category, ExamDifficulty
import nested_admin



@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')



class QuestionOptionInline(nested_admin.NestedTabularInline):
    model = QuestionOption
    extra = 4  # Number of extra forms to display in the admin

class QuestionInline(nested_admin.NestedTabularInline):
    model = Question
    extra = 0  # Number of extra forms to display in the admin
    inlines = [QuestionOptionInline]

@admin.register(Exam)
class ExamAdmin(nested_admin.NestedModelAdmin):
    list_display = ('exam_id', 'title', 'user', 'total_questions', 'questions_to_generate', 'total_marks', 'correct_answers', 'wrong_answers', 'passed', 'last_date', 'created_at', 'updated_at')
    list_filter = ('passed',)
    search_fields = ('title', 'user__username', 'exam_id')
    inlines = [QuestionInline]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change:  # Only generate questions when creating a new exam
            for i in range(obj.total_questions):
                Question.objects.create(exam=obj, text=f'Question {i+1}', marks=1)
                
                
                
@admin.register(ExamDifficulty)
class ExamDifficultyAdmin(admin.ModelAdmin):
    list_display = ('exam', 'difficulty1_percentage', 'difficulty2_percentage', 'difficulty3_percentage', 'difficulty4_percentage', 'difficulty5_percentage', 'difficulty6_percentage')
    search_fields = ('exam__title',)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'exam', 'marks', 'category', 'difficulty_level')
    list_filter = ('difficulty_level', 'exam', 'category')
    search_fields = ('text', 'exam__title', 'category__name')
    ordering = ('-difficulty_level',)  # Optional: Order questions by difficulty level
    
    # Optional: Add custom form fields or fieldsets if needed
    fieldsets = (
        (None, {
            'fields': ('text', 'exam', 'marks', 'category', 'difficulty_level')
        }),
    )

@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct')
    list_filter = ('question__exam', 'is_correct')
    search_fields = ('text', 'question__text')

@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ('exam', 'user', 'total_correct_answers', 'timestamp')
    search_fields = ('exam__title', 'user__username')
    list_filter = ('timestamp',)

@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'exam')
    search_fields = ('user__username', 'exam__title')
    list_filter = ('exam', 'score')
