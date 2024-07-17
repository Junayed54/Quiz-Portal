from django.urls import path
from .views import home, signup_view, login_view, exam_list_view

urlpatterns = [
    path('', home, name='home'),
    path('signup/', signup_view, name='sign_up'),
    path('login/', login_view, name='log_in'),
    # path('exams/', exam_list_view, name='mcq_exams'),
]
