from django.contrib import admin
from .models import Exam, Status, Question, QuestionOption, ExamAttempt, Leaderboard, Category, ExamDifficulty
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
                

class StatusAdmin(admin.ModelAdmin):
    list_display = ('id', 'exam', 'status', 'reviewed_by')  # Display important fields
    list_filter = ('status', 'reviewed_by')  # Add filters for status and reviewer
    search_fields = ('exam__title',)  # Enable search on exam title and description
    autocomplete_fields = ['reviewed_by']  # Allows selecting from a long list of users easily
    readonly_fields = ['exam']  # Make exam field read-only
    list_select_related = ('exam', 'reviewed_by')  # Optimizes queries by selecting related objects

    def get_queryset(self, request):
        """Optimize queries by selecting related exam and reviewer"""
        queryset = super().get_queryset(request)
        return queryset.select_related('exam', 'reviewed_by')

admin.site.register(Status, StatusAdmin)      
                
@admin.register(ExamDifficulty)
class ExamDifficultyAdmin(admin.ModelAdmin):
    list_display = ('exam', 'difficulty1_percentage', 'difficulty2_percentage', 'difficulty3_percentage', 'difficulty4_percentage', 'difficulty5_percentage', 'difficulty6_percentage')
    search_fields = ('exam__title',)


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'exam', 'category', 'difficulty_level', 'marks', 'status', 'created_by', 'reviewed_by', 'created_at', 'updated_at')
    list_filter = ('difficulty_level', 'status', 'category', 'exam')
    # search_fields = ('text', 'remarks')
    # ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    # list_editable = ('status', 'marks', 'difficulty_level')
    
    # To display related options in the question admin interface
    def get_options(self, obj):
        return ", ".join([str(option) for option in obj.get_options()])
    
    get_options.short_description = 'Options'

# Register the admin class
admin.site.register(Question, QuestionAdmin)



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

# @admin.register(QuestionStatus)
# class QuestionStatusAdmin(admin.ModelAdmin):
#     list_display =' __all__'
    
    
# admin.site.register(QuestionStatus)