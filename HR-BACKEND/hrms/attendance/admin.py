from django.contrib import admin
from .models import Attendance


class AttendanceAdmin(admin.ModelAdmin):

    # ✅ Columns in admin table
    list_display = (
        'id',
        'user_id',   # 🔥 changed
        'date',
        'check_in',
        'check_out'
    )

    # ✅ Search bar
    search_fields = (
        'user_id',   # 🔥 changed
    )

    # ✅ Filters
    list_filter = (
        'date',
    )

    # ✅ Sorting
    ordering = ('-date',)

    # ✅ Pagination
    list_per_page = 10


# ✅ Register model
admin.site.register(Attendance, AttendanceAdmin)