from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, date
from .models import Attendance
from app1.models import Employee


# ✅ CHECK-IN (ONLY ONCE PER DAY)
@api_view(['POST'])
def check_in(request):

    user_id = request.data.get("user_id")

    print("USER ID:", user_id)   # 👈 DEBUG

    if not user_id:
        return Response({"message": "User ID missing"})

    user_id = int(user_id)   # ✅ important

    today = date.today()

    record = Attendance.objects.filter(user_id=user_id, date=today).first()

    if record:
        return Response({"message": "Already checked in"})

    Attendance.objects.create(
        user_id=user_id,
        date=today,
        check_in=datetime.now().time()
    )

    print("DATA SAVED ✅")   # 👈 DEBUG

    return Response({"message": "Check-in success"})


# ✅ CHECK-OUT (ONLY ONCE)
@api_view(['POST'])
def check_out(request):
    user_id = int(request.data.get("user_id"))
    # user_id = request.data.get("user_id")

    if not user_id:
        return Response({"message": "User ID missing"})

    today = date.today()

    record = Attendance.objects.filter(user_id=user_id, date=today).first()

    if not record:
        return Response({"message": "No check-in found"})

    if record.check_out:
        return Response({"message": "Already checked out"})

    record.check_out = datetime.now().time()
    record.summary = request.data.get("summary", "")
    record.save()

    return Response({"message": "Check-out success"})


# ✅ TRACKER (ONLY USER DATA)
@api_view(['GET'])
def attendance_list(request):

    user_id = request.GET.get("user_id")

    print("URL USER ID:", user_id)

    if not user_id:
        return Response([])

    user_id = int(user_id)

    all_data = Attendance.objects.all()
    print("ALL DATA:", list(all_data.values()))

   
    Attendance.objects.filter(user_id=user_id)  
    # print("FILTERED DATA:", list(data.values()))

    # return Response(list(data.values()))
    queryset = Attendance.objects.filter(user_id=user_id)

    print("FILTERED DATA:", list(queryset.values()))

    return Response(list(queryset.values()))

# ✅ ADMIN DASHBOARD
@api_view(['GET'])
def admin_dashboard(request):
    today = date.today()

    employees = Employee.objects.all()
    data = []

    for emp in employees:
        user_id = emp.id   # your Attendance uses user_id = Employee.id

        records = Attendance.objects.filter(user_id=user_id)

        present_days = records.filter(check_in__isnull=False).count()
        total_days = records.count()
        absent_days = total_days - present_days

        today_record = records.filter(date=today).first()

        data.append({
            "emp_id": emp.employee_id,   # ✅ CORRECT FIELD
            "name": emp.name,            # ✅ CORRECT FIELD

            "today_status": "Present" if today_record and today_record.check_in else "Absent",

            "login_time": today_record.check_in if today_record else None,
            "logout_time": today_record.check_out if today_record else None,

            "present_days": present_days,
            "absent_days": absent_days,
            "total_days": total_days,
        })

    return Response(data)