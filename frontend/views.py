from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
def home(request):
    return render(request, 'Html/index.html')

def signup_view(request):
    return render(request, 'Html/sign-up-cover.html')


def login_view(request):
    
    return render(request, 'Html/sign-in-cover.html')
    

@login_required
def exam_list_view(request):
    return render(request, 'exams.html')



# def questions(request, id):
    