from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Candidate, Education, Employee
from .serializers import CandidateSerializer
from datetime import date
from django.contrib.auth.hashers import make_password
from rest_framework import status


# ✅ CREATE CANDIDATE

@api_view(['POST'])
def add_candidate(request):
    try:
        print("API HIT")

        data = request.data
        files = request.FILES

        print("DATA:", data)
        print("FILES:", files)

        # 🔥 get photo
        photo = files.get("photo")

        # ✅ create candidate
        candidate = Candidate.objects.create(
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            password=data.get("password"),
            aadhaar=data.get("aadhaar"),
            pan=data.get("pan"),
            uan=data.get("uan"),
            official_email=data.get("official_email"),

            address_line1=data.get("address_line1"),
            address_line2=data.get("address_line2"),
            city=data.get("city"),

            experience=data.get("experience"),
            source=data.get("source"),
            skills=data.get("skills"),
            department=data.get("department"),

            photo=photo,
        )

        print("SAVED:", candidate.id)

        return Response({"message": "Saved successfully"})

    except Exception as e:
        print("ERROR:", str(e))
        return Response({"error": str(e)}, status=400)

        # ✅ Education
        education_list = data.get("education", [])
        for edu in education_list:
            Education.objects.create(
                candidate=candidate,
                school=edu.get("School Name", ""),
                degree=edu.get("Degree / Diploma", ""),
                field_of_study=edu.get("Field of Study", ""),
                notes=edu.get("Notes", "")
            )
            print("SAVED:", candidate.id)

        return Response({"message": "Candidate saved successfully"})
        
    except Exception as e:
        print("ERROR:", str(e))   # 🔥 ADD THIS
        
        return Response({"error": str(e)})


# ✅ GET CANDIDATES (FIXED)
@api_view(['GET'])
def get_candidates(request):
    try:
        candidates = Candidate.objects.all()   # 🔥 SIMPLE FIX
        serializer = CandidateSerializer(candidates, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)})


# ✅ DELETE
@api_view(['DELETE'])
def delete_candidate(request, id):
    try:
        candidate = Candidate.objects.get(id=id)
        candidate.delete()
        return Response({"message": "Deleted successfully"})
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate not found"})


# ✅ UPDATE
@api_view(['PUT'])
def update_candidate(request, id):
    try:
        candidate = Candidate.objects.get(id=id)
        data = request.data

        candidate.first_name = data.get("first_name", candidate.first_name)
        candidate.last_name = data.get("last_name", candidate.last_name)
        candidate.email = data.get("email", candidate.email)
        candidate.phone = data.get("phone", candidate.phone)

        if request.FILES.get('photo'):
            candidate.photo = request.FILES.get('photo')

        candidate.save()

        return Response({"message": "Updated successfully"})

    except Exception as e:
        return Response({"error": str(e)})



from datetime import date
from app1.models import Employee, Candidate
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def approve_candidate(request, id):
    print("APPROVE CLICKED")

    try:
        # ✅ Get candidate
        candidate = Candidate.objects.get(id=id)

        # 🔥 FINAL ID LOGIC (CORRECT)
        last_emp = Employee.objects.filter(employee_id__startswith="ARCE")\
                                   .order_by('-employee_id')\
                                   .first()

        if last_emp:
            last_num = int(last_emp.employee_id.replace("ARCE", ""))
            new_num = last_num + 1
        else:
            new_num = 500

        emp_id = f"ARCE{new_num}"

        # 🔥 SAFETY (avoid duplicate)
        while Employee.objects.filter(employee_id=emp_id).exists():
            new_num += 1
            emp_id = f"ARCE{new_num}"

        print("Generated ID:", emp_id)

        # ✅ Create employee
        emp = Employee.objects.create(
            employee_id=emp_id,
            name=candidate.first_name + " " + candidate.last_name,
            email=candidate.email,
            password=candidate.password,
            phone=candidate.phone or "9999999999",
            department=candidate.department or "IT",
            date_of_joining=date.today(),
            role="employee",

            aadhaar=candidate.aadhaar or "",
            pan=candidate.pan or "",
            city=candidate.city or "",
            skills=candidate.skills or ""
        )

        print("EMP CREATED:", emp)

       
        # candidate.status = "Approved"
        # candidate.save()
        candidate.delete()

        return Response({
            "message": "Approved",
            "employee_id": emp_id
        })

    except Exception as e:
        print("ERROR:", str(e))
        return Response({"error": str(e)}, status=400)

        Employee.objects.create(
            employee_id=emp_id,
            name=candidate.first_name + " " + candidate.last_name,
            email=candidate.email,
            password=candidate.password,
            phone=candidate.phone,
            department=candidate.department,
            date_of_joining=date.today(),
            role="employee",

            aadhaar=candidate.aadhaar,
            pan=candidate.pan,
            city=candidate.city,
            skills=candidate.skills
        )

        candidate.delete()

        return Response({
            "message": "Approved",
            "employee_id": emp_id
        })

    except Exception as e:
        print("ERROR:", str(e))  # 🔥 DEBUG
        # return Response({"error": str(e)})
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ✅ DASHBOARD
@api_view(['GET'])
def dashboard(request):
    from attendance.models import Attendance
    today = date.today()

    present = Attendance.objects.filter(
        check_in__isnull=False,
        date__month=today.month
    ).count()

    absent = Attendance.objects.filter(
        check_in__isnull=True,
        date__month=today.month
    ).count()

    return Response({
        "present_days": present,
        "absent_days": absent,
        "pending_requests": 0,
        "leave_balance": 20
    })


# ✅ EMPLOYEE LIST
@api_view(['GET'])
def list_employees(request):
    emp_id = request.GET.get("employee_id")
    user_id = request.GET.get("user_id")

    # 🔥 IF employee_id USED
    if emp_id:
        employees = Employee.objects.filter(employee_id=emp_id)

    # 🔥 IF user_id USED
    elif user_id:
        emp = Employee.objects.get(id=user_id)

        if emp.role == "admin":
            employees = Employee.objects.all()
        else:
            employees = Employee.objects.filter(id=user_id)

    else:
        employees = Employee.objects.all()

    return Response(list(employees.values(
        "id",
        "employee_id",
        "name",
        "email",
        "phone",
        "department",
        "date_of_joining",
        "role",
        "aadhaar",
        "pan",
        "city",
        "skills"
    )))