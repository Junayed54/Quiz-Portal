from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ExamDetailView, CalculateResultsView, LeaderboardListView #SubmitAnswerView

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')

urlpatterns = [
    path('', include(router.urls)),
    path('exams/exam_detail/<uuid:exam_id>/', ExamDetailView.as_view(), name='exam-detail' ),   
    path('exams/<uuid:exam_id>/start/', ExamViewSet.as_view({'get': 'start_exam'}), name='start-exam'),
    path('exams/<uuid:exam_id>/questions/', ExamViewSet.as_view({'get': 'get_questions'}), name='exam-questions'),
    path('exams/<uuid:exam_id>/results/', CalculateResultsView.as_view(), name='calculate-results'),
    path('leaderboard/<uuid:exam_id>/', LeaderboardListView.as_view(), name='leaderboard'),
    
    path('exam_list/', TemplateView.as_view(template_name='exam_list.html'), name='exam-list'),
    path('exam_detail/<uuid:exam_id>/', TemplateView.as_view(template_name='exam_detail.html'), name='exam_detail'),
    path('start_exam/<uuid:exam_id>/', TemplateView.as_view(template_name='start_exam.html'), name='start-exam'),
    path('leader_board/<uuid:exam_id>/', TemplateView.as_view(template_name='leaderboard.html'), name='leader_board'),
]
