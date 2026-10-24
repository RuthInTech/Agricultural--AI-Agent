
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

#REGISTRATION WORK
class RegisterSerializer(serializers.ModelSerializer):
    password= serializers.CharField(write_only= True, min_length= 8, style= {"input_type": "password"})
    password2 = serializers.CharField(write_only= True, style={"input_type":"password"})
    class Meta:
        model = User
        fields= ["id", "first_name","last_name","email",
                 "phone_number", "password", "password2"]
        read_only_fields = ["id"]

    def validate(self, attrs):
           if attrs["password"] != attrs["password2"]:
               raise serializers.ValidationError({"password2":"Passwords must match"})

           validate_password(attrs["password"])
           return attrs

    def create(self, validated_data):
            validated_data.pop("password2")

            first_name = validated_data["first_name"]

            username= first_name

            counter = 2

            while User.objects.filter(username=username).exists():
                username = f"{first_name}{counter}"
                counter+=1

            return User.objects.create_user( username=username,**validated_data)

#LOGIN WORK
class LoginSerializer(serializers.Serializer):
     identifier= serializers.CharField()
     password= serializers.CharField(write_only=True, style= {"input_type": "password"})

     def validate(self, attrs):
        identifier= attrs.get("identifier")
        password= attrs.get("password")

        try:
          user = User.objects.get(username= identifier)
        except User.DoesNotExist:
          try:
            user = User.objects.get(email= identifier)
          except User.DoesNotExist:
              raise serializers.ValidationError({"identifier": "Invalid Email/Password"})

        user= authenticate(username= user.username, password=password)

        if user is None:
            raise serializers.ValidationError({"identifier": "Invalid username/password"})

        if not user.is_active:
            raise serializers.ValidationError({"identifier": "The account is innactive"})

        refersh = RefreshToken.for_user(user)

        return {
            "refresh": str(refersh),
            "access": str(refersh.access_token)
        }

