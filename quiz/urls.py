from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ExamDetailView, LeaderboardListView, QuestionViewSet, QuestionOptionViewSet, UserCreatedExamsView, ExamUploadView, CategoryViewSet, ExamDifficultyView #SubmitAnswerView, CalculateResultsView

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'questions', QuestionViewSet)
router.register(r'question-options', QuestionOptionViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('exams/exam_detail/<uuid:exam_id>/', ExamDetailView.as_view(), name='exam-detail' ),   
    path('exams/<uuid:exam_id>/start/', ExamViewSet.as_view({'get': 'start_exam'}), name='start-exam'),
    path('exams/<uuid:exam_id>/questions/', ExamViewSet.as_view({'get': 'get_questions'}), name='exam-questions'),
    path('leaderboard/<uuid:exam_id>/', LeaderboardListView.as_view(), name='leaderboard'),
    path('upload-excel/', ExamUploadView.as_view(), name='upload_excel'),
    path('user_exams_list/', UserCreatedExamsView.as_view(), name='user-created-exams'),
    path('add-exam-difficulty/', ExamDifficultyView.as_view(), name='add_exam_difficulty'),

    
    
    path('exam_list/', TemplateView.as_view(template_name='Html/custom/exam_list.html'), name='exam-list'),
    path('exam_detail/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/exam_detail.html'), name='exam_detail'),
    path('start_exam/<uuid:exam_id>/', TemplateView.as_view(template_name='Html/custom/start_exam.html'), name='start-exam'),
    path('leader_board/<uuid:exam_id>/', TemplateView.as_view(template_name='leaderboard.html'), name='leader_board'),
    path('create_exam/', TemplateView.as_view(template_name='Html/icons.html'), name='create_exam'),
    path('user_exams/', TemplateView.as_view(template_name='Html/custom/user_exams.html'), name='user_exams'),
    
]
