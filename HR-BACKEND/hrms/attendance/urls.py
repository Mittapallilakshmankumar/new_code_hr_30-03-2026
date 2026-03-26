from django.urls import path
from .views import check_in, check_out, attendance_list, admin_dashboard

urlpatterns = [
    path('check-in/', check_in),
    path('check-out/', check_out),
    path('attendance/', attendance_list),
    path('admin-dashboard/', admin_dashboard),
]