from django.urls import path
from .views import apply_leave, list_leaves, approve_leave, reject_leave,get_employee

urlpatterns = [
    path('apply/', apply_leave),
    path('list/', list_leaves),
    path('approve/<int:id>/', approve_leave),
    path('reject/<int:id>/', reject_leave),
    path('employee/<int:user_id>/', get_employee),
]