from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
def home(request):
    return render(request, 'home.html')

def signup_view(request):
    return render(request, 'signup.html')


def login_view(request):
    
    return render(request, 'login.html')
    

@login_required
def exam_list_view(request):
    return render(request, 'exams.html')



# def questions(request, id):
    