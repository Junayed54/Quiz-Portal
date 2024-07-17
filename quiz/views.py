from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from .serializers import LeaderboardSerializer, ExamSerializer, QuestionSerializer, QuestionOptionSerializer
from .models import Exam, Question, QuestionOption, Leaderboard, ExamAttempt
from .permissions import IsAdminOrReadOnly
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.views.generic.detail import DetailView

from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

User = get_user_model()


class CalculateResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        user = request.user
        exam = Exam.objects.get(pk=exam_id, user=user)

        if exam.user != user:
            return Response({'detail': 'No exam attempt found for this user.'}, status=status.HTTP_404_NOT_FOUND)

        exam.end_time = timezone.now()
        exam.passed = exam.correct_answers >= (exam.total_marks / 2)  # Assuming passing marks are 50% of total
        exam.save()

        # Calculate results
        result_data = {
            'correct_answers': exam.correct_answers,
            'wrong_answers': exam.wrong_answers,
            'passed': exam.passed,
        }

        return Response(result_data)

class LeaderboardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        try:
            leaderboards = Leaderboard.objects.filter(exam_id=exam_id).order_by('-score')[:10]  # Get top 10 scores for the exam
            serializer = LeaderboardSerializer(leaderboards, many=True)
            print(serializer.data)
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
    
    
    
class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAdminOrReadOnly]

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