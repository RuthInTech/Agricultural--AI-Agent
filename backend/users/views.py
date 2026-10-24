from django.shortcuts import render
from rest_framework import generics 
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.response import Response

from .serializers import RegisterSerializer, LoginSerializer


#MY REGISTRER VIEW
class RegisterView(generics.CreateAPIView):
    serializer_class= RegisterSerializer
    permission_classes= [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer= self.get_serializer(data= request.data)
        serializer.is_valid(raise_exception= True)
        self.perform_create(serializer)

        return Response({"message": "User created Successfully"}, status=status.HTTP_201_CREATED)


#MY LOGIN VIEW
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data= request.data)
        serializer.is_valid(raise_exception= True)

        return Response(serializer.validated_data)


#TEST JWT(Created For Testing Purpose Only)
class MeView(generics.GenericAPIView):
    permission_classes= [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email
        })