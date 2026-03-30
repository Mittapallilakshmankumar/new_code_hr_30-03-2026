



# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from app1.models import Employee
# from django.contrib.auth.hashers import check_password  # 🔥 ADD

# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from app1.models import Employee
# from django.contrib.auth.hashers import check_password

# @api_view(['POST'])
# def login_view(request):
#     email = request.data.get('email')
#     password = request.data.get('password')

#     employee = Employee.objects.filter(email=email).first()

#     if not employee:
#         return Response({"error": "User not found"}, status=404)

#     if not check_password(password, employee.password):
#         return Response({"error": "Invalid password"}, status=400)

#     return Response({
#         "message": "Login success",
#         "user_id": employee.id,
#         "name": employee.name,
#         "employee_id": employee.employee_id,
#         "department": employee.department,
#         "role": employee.role,
#         "email": employee.email   # ✅ IMPORTANT
#     })



from rest_framework.decorators import api_view
from rest_framework.response import Response
from app1.models import Employee
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    employee = Employee.objects.filter(email=email).first()

    if not employee:
        return Response({"error": "User not found"}, status=404)

    if not check_password(password, employee.password):
        return Response({"error": "Invalid password"}, status=400)

    # 🔥 CREATE TOKEN
    refresh = RefreshToken.for_user(employee)

    return Response({
        "message": "Login success",

        # ✅ TOKEN (VERY IMPORTANT)
        "access": str(refresh.access_token),
        "refresh": str(refresh),

        # ✅ USER DATA
        "user_id": employee.id,
        "name": employee.name,
        "employee_id": employee.employee_id,
        "department": employee.department,
        "role": employee.role,
        "email": employee.email
    })