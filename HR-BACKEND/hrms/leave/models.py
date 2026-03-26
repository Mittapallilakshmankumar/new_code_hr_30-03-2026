from django.db import models

class Leave(models.Model):
    user_id = models.IntegerField()   # 🔥 IMPORTANT (for filtering)

    name = models.CharField(max_length=100)
    employee_id = models.CharField(max_length=50)
    department = models.CharField(max_length=100)

    leave_type = models.CharField(max_length=50)
    from_date = models.DateField()
    to_date = models.DateField()
    reason = models.TextField()

    status = models.CharField(max_length=20, default="Pending")

    def __str__(self):
        return self.name