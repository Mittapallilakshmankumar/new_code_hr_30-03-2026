from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Leave
from app1.models import Employee


# ✅ APPLY LEAVE
@api_view(['POST'])
def apply_leave(request):
    user_id = request.data.get('user_id')

    try:
        emp = Employee.objects.get(id=user_id)

        Leave.objects.create(
            user_id=emp.id,   # 🔥 IMPORTANT
            name=emp.name,
            employee_id=emp.employee_id,
            department=emp.department,
            leave_type=request.data.get('leave_type'),
            from_date=request.data.get('from_date'),
            to_date=request.data.get('to_date'),
            reason=request.data.get('reason'),
            status="Pending"
        )

        return Response({"message": "Leave Applied Successfully"})

    except Employee.DoesNotExist:
        return Response({"error": "Employee not found"}, status=404)


# ✅ GET LEAVES (USER + ADMIN)
@api_view(['GET'])
def list_leaves(request):
    user_id = request.GET.get('user_id')

    if user_id:
        leaves = Leave.objects.filter(user_id=user_id).values()   # 👤 USER
    else:
        leaves = Leave.objects.all().values()   # 👨‍💼 ADMIN

    return Response(leaves)


# ✅ APPROVE LEAVE
@api_view(['PUT'])
def approve_leave(request, id):
    try:
        leave = Leave.objects.get(id=id)
        leave.status = "Approved"
        leave.save()
        return Response({"message": "Leave Approved"})
    except Leave.DoesNotExist:
        return Response({"error": "Leave not found"}, status=404)


# ✅ REJECT LEAVE
@api_view(['PUT'])
def reject_leave(request, id):
    try:
        leave = Leave.objects.get(id=id)
        leave.status = "Rejected"
        leave.save()
        return Response({"message": "Leave Rejected"})
    except Leave.DoesNotExist:
        return Response({"error": "Leave not found"}, status=404)


# ✅ GET EMPLOYEE DETAILS (AUTO FILL)
@api_view(['GET'])
def get_employee(request, user_id):
    emp = Employee.objects.filter(id=user_id).first()

    if emp:
        return Response({
            "name": emp.name,
            "employee_id": emp.employee_id,
            "department": emp.department,
        })

    return Response({"error": "Employee not found"})