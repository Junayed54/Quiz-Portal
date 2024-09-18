# from rest_framework import viewsets, status
# from rest_framework.decorators import api_view
# from rest_framework.views import APIView
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from .models import QuestionStatus, Question, User
# from .serializers import QuestionStatusSerializer, QuestionSerializer
# from users.serializers import UserSerializer
# from .permissions import IsAdminOrReadOnly
# from django.views.generic import ListView
# from django.db.models import Count
# class QuestionStatusViewSet(viewsets.ModelViewSet):
#     queryset = QuestionStatus.objects.all()
#     serializer_class = QuestionStatusSerializer
#     permission_classes = [IsAdminOrReadOnly]
#     @action(detail=True, methods=['get'])
#     def history(self, request, pk=None):
#         question = self.get_object()
#         status_history = QuestionStatus.objects.filter(question=question).order_by('-updated_at')
#         serializer = QuestionStatusSerializer(status_history, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @action(detail=False, methods=['get'])
#     def submitted_users(self, request):
#         # Users who have submitted questions
#         users = User.objects.filter(question_created_by__status_history__status='submitted').distinct()
#         user_data = []

#         for user in users:
#             total_questions = QuestionStatus.objects.filter(question__created_by=user, status='submitted').count()
#             user_data.append({
#                 'user_id': user.id,
#                 'username': user.username,
#                 'total_questions': total_questions,
#             })

#         return Response(user_data)

#     @action(detail=False, methods=['get'])
#     def reviewed_users(self, request):
#         # Users who have reviewed questions
#         users = User.objects.filter(question_reviewed_by__status_history__status='approved').distinct()
#         user_data = []

#         for user in users:
#             total_questions = QuestionStatus.objects.filter(user=user, status='approved').count()
#             # print(total_)
#             user_data.append({
#                 'user_id': user.id,
#                 'username': user.username,
#                 'total_questions': total_questions,
#             })

#         return Response(user_data)

#     @action(detail=False, methods=['get'])
#     def questions_by_user(self, request, user_id=None):
#         questions = Question.objects.filter(created_by=user_id) | Question.objects.filter(status_history__reviewer=user_id)
#         question_data = []

#         for question in questions:
#             options = question.options.all()
#             question_data.append({
#                 'id': question.id,
#                 'text': question.text,
#                 'options': [{'text': option.text, 'is_correct': option.is_correct} for option in options],
#                 'difficulty_level': question.difficulty_level,
#                 'category_name': question.category.name,
#             })

#         return Response(question_data)


# class AssignedQuestionsSummaryAPIView(APIView):
#     permission_classes = [IsAdminOrReadOnly]  # Ensure user is logged in

#     def get(self, request, *args, **kwargs):
#         # Get the queryset for questions reviewed by the logged-in user
#         queryset = Question.objects.filter(reviewed_by=request.user).values(
#             'created_by__username', 'created_by__id'
#         ).annotate(
#             total_questions=Count('id')
#         ).order_by('-total_questions')
        
#         print(queryset)

#         # If no data found, return a custom message with 404 status
#         if not queryset:
#             return Response({
#                 'message': 'No questions found for this reviewer.'
#             }, status=status.HTTP_404_NOT_FOUND)

#         # Otherwise, return the queryset as a JSON response with 200 status
#         return Response({
#             'message': 'Questions summary retrieved successfully.',
#             'data': queryset
#         }, status=status.HTTP_200_OK)
    
# class QuestionsByUserForReviewerView(APIView):
#     permission_classes = [IsAdminOrReadOnly]
#     queryset = Question.objects.all()
#     def get(self, request, user_id):
#         """
#         Get all questions submitted by a specific user (teacher) for the reviewer.
#         """
#         reviewer_id = self.request.user.id
#         print(reviewer_id)
#         questions = Question.objects.filter(assigned_reviewer_id=reviewer_id, submitted_by_id=user_id)

#         if not questions.exists():
#             return Response({"message": "No questions found for this user."}, status=404)
         
#         user = self.request.user
#         user_questions = Question.objects.filter()  # Filter by the logged-in user
#         serializer = self.get_serializer(user_questions, many=True)
#         return Response(serializer.data)
        
        
#         # # Serialize the questions data
#         # questions_data = [
#         #     {
#         #         'id': question.id,
#         #         'text': question.text,
#         #         'difficulty_level': question.difficulty_level,
#         #         'category_name': question.category.name
#         #     }
#         #     for question in questions
#         # ]
        
#         # return Response(questions_data, status=200)