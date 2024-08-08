from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from .serializers import LeaderboardSerializer, ExamSerializer, QuestionSerializer, QuestionOptionSerializer, CategorySerializer
from .models import Exam, Question, QuestionOption, Leaderboard, ExamAttempt, Category
from .permissions import IsAdminOrReadOnly, IsStudent
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.views.generic.detail import DetailView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from django.utils.dateparse import parse_date
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
import openpyxl
import pandas as pd  
User = get_user_model()



class LeaderboardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        try:
            leaderboards = Leaderboard.objects.filter(exam_id=exam_id).order_by('-score')[:10]  # Get top 10 scores for the exam
            serializer = LeaderboardSerializer(leaderboards, many=True)
            # print(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Leaderboard.DoesNotExist:
            raise Http404("Leaderboard does not exist for this exam.")


class ExamDetailView(generics.RetrieveAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    lookup_field = 'exam_id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def perform_create(self, serializer):
        exam = serializer.validated_data.get('exam')
        category = serializer.validated_data.get('category')
        question = serializer.save(exam=exam, category=category)
        return Response({"question_id": question.id})


    

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    
    def perform_create(self, serializer):
        exam = serializer.save(created_by=self.request.user)
        return Response({'exam_id': exam.exam_id}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='start', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def start_exam(self, request, pk=None):
        exam = self.get_object()
        user = request.user

        return Response({
            'exam_id': exam.exam_id,
            'title': exam.title,
            'total_questions': exam.total_questions,
            'start_time': timezone.now(),  # Just return the current time as start time
        })

    @action(detail=True, methods=['get'], url_path='questions', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def get_questions(self, request, pk=None):
        exam = self.get_object()
        questions = Question.objects.filter(exam=exam)
        
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
    

    @action(detail=True, methods=['post'], url_path='submit', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
    def submit_exam(self, request, pk=None):
        exam = self.get_object()
        user = request.user

        answers = request.data.get('answers', [])

        correct_answers = 0
        wrong_answers = 0

        # Calculate correct and wrong answers
        for answer in answers:
            question_id = answer.get('question_id')
            selected_option_id = answer.get('option')
            
            try:
                question = Question.objects.get(id=question_id, exam=exam)
                selected_option = QuestionOption.objects.get(id=selected_option_id, question=question)

                if selected_option.is_correct:
                    correct_answers += 1
                else:
                    wrong_answers += 1

            except (Question.DoesNotExist, QuestionOption.DoesNotExist):
                return Response({'detail': 'Invalid question or option provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
            exam.correct_answers = correct_answers

        # Create an exam attempt instance
        exam_attempt = ExamAttempt.objects.create(
            exam=exam,
            user=user,
            total_correct_answers=correct_answers
        )

        # Update the exam fields
        exam.correct_answers = correct_answers
        exam.wrong_answers = wrong_answers
        exam.save()

        # Update the leaderboard with the best score
        Leaderboard.update_best_score(user, exam)

        return Response({
            'correct_answers': correct_answers,
            'wrong_answers': wrong_answers,
        })
        
    
    def destroy(self, request, *args, **kwargs):
        exam = self.get_object()
        if request.user.role in ['admin', 'teacher']:
            self.perform_destroy(exam)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'detail': 'You do not have permission to delete this exam.'}, status=status.HTTP_403_FORBIDDEN)
           
        
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def perform_create(self, serializer):
        exam = serializer.validated_data.get('exam')
        question = serializer.save(exam=exam)
        return Response({"question_id": question.id})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrReadOnly])
    def add_option(self, request, pk=None):
        question = self.get_object()
        serializer = QuestionOptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(question=question)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class QuestionOptionViewSet(viewsets.ModelViewSet):
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    authentication_classes = [JWTAuthentication]
    
    def perform_create(self, serializer):
        question = serializer.validated_data.get('question')  # Ensure exam is included
        serializer.save(question=question)

    
    
class UserCreatedExamsView(generics.ListAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return Exam.objects.filter(created_by=user)


class ExamUploadView(APIView):
    def post(self, request, *args, **kwargs):
        exam_id = request.POST.get('exam_id')
        
        if not exam_id:
            return Response({"error": "Exam ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if 'file' not in request.FILES:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            exam = Exam.objects.get(exam_id=exam_id)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)
        
        file = request.FILES['file']
        try:
            df = pd.read_excel(file)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        required_columns = ['Question', 'Option1', 'Option2', 'Option3', 'Option4', 'Answer', 'Options_num', 'Category']
        if not all(col in df.columns for col in required_columns):
            return Response({"error": f"Missing one of the required columns: {', '.join(required_columns)}"}, status=status.HTTP_400_BAD_REQUEST)

        question_count = 0
        total_marks = 0

        try:
            with transaction.atomic():
                for _, row in df.iterrows():
                    question_text = row['Question']
                    options = [row['Option1'], row['Option2'], row['Option3'], row['Option4']]
                    correct_answer = row['Answer'].strip().lower()
                    option_num = row['Options_num']
                    category_name = row['Category']

                    category, created = Category.objects.get_or_create(name=category_name)
                    # option_num = int(option_num)
                    # total_marks += option_num
                    question_count += 1

                    question = Question.objects.create(
                        exam=exam,
                        text=question_text,
                        marks=1,
                        category=category
                    )

                    for i, option_text in enumerate(options, start=1):
                        option_label = f"option {i}".strip().lower()
                        is_correct = (option_label == correct_answer)
                        QuestionOption.objects.create(
                            question=question,
                            text=option_text,
                            is_correct=is_correct
                        )
                
                exam.total_questions = question_count
                exam.total_marks = question_count
                exam.save()

            return Response({"message": "All questions created successfully."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# class ExamViewSet(viewsets.ModelViewSet):
#     queryset = Exam.objects.all()
#     serializer_class = ExamSerializer
#     permission_classes = [IsAdminOrReadOnly]

#     @action(detail=True, methods=['get'], url_path='start', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
#     def start_exam(self, request, pk=None):
#         exam = self.get_object()
#         user = request.user

#         # Check if the user has already taken the exam
#         if Exam.objects.filter(user=user, exam_id=exam.exam_id, passed=True).exists():
#             return Response({'detail': 'You have already completed this exam.'}, status=status.HTTP_400_BAD_REQUEST)

#         # Mark the exam as started for the user
#         exam.user = user
#         exam.start_time = timezone.now()
#         exam.save()

#         return Response({
#             'exam_id': exam.exam_id,
#             'title': exam.title,
#             'total_questions': exam.total_questions,
#             'start_time': exam.start_time,
#         })

#     @action(detail=True, methods=['get'], url_path='questions', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
#     def get_questions(self, request, pk=None):
#         exam = self.get_object()
#         questions = Question.objects.filter(exam=exam)
#         serializer = QuestionSerializer(questions, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=['post'], url_path='submit', permission_classes=[IsAuthenticated], authentication_classes=[JWTAuthentication])
#     def submit_exam(self, request, pk=None):
#         exam = self.get_object()
#         user = request.user

#         answers = request.data.get('answers', [])

#         correct_answers = 0
#         wrong_answers = 0

#         # Calculate correct and wrong answers
#         for answer in answers:
#             question_id = answer.get('question_id')
#             selected_option_id = answer.get('option')
            
#             try:
#                 question = Question.objects.get(id=question_id, exam=exam)
#                 selected_option = QuestionOption.objects.get(id=selected_option_id, question=question)

#                 if selected_option.is_correct:
#                     correct_answers += 1
#                 else:
#                     wrong_answers += 1

#             except Question.DoesNotExist or QuestionOption.DoesNotExist:
#                 return Response({'detail': 'Invalid question or option provided.'}, status=status.HTTP_400_BAD_REQUEST)

#         # Save the result to the exam instance
#         exam.correct_answers = correct_answers
#         exam.wrong_answers = wrong_answers
#         exam.end_time = timezone.now()
#         exam.passed = correct_answers >= (exam.total_questions / 2)  # Example pass condition
#         exam.save()

#         # Update or create leaderboard entry
#         leaderboard_entry, created = Leaderboard.objects.get_or_create(user=user, exam=exam)
#         leaderboard_entry.score = correct_answers
#         leaderboard_entry.save()

#         return Response({
#             'correct_answers': correct_answers,
#             'wrong_answers': wrong_answers,
#         })


# class CalculateResultsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, exam_id):
#         user = request.user
#         exam = Exam.objects.get(pk=exam_id, user=user)

#         if exam.user != user:
#             return Response({'detail': 'No exam attempt found for this user.'}, status=status.HTTP_404_NOT_FOUND)

#         exam.end_time = timezone.now()
#         exam.passed = exam.correct_answers >= (exam.total_marks / 2)  # Assuming passing marks are 50% of total
#         exam.save()

#         # Calculate results
#         result_data = {
#             'correct_answers': exam.correct_answers,
#             'wrong_answers': exam.wrong_answers,
#             'passed': exam.passed,
#         }

#         return Response(result_data)
