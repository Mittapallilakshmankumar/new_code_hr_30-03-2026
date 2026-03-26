from django.db import models

class Attendance(models.Model):
    user_id = models.IntegerField()
    date = models.DateField()   # ❗ NO auto_now_add

    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)

    notes = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('user_id', 'date')

    def __str__(self):
        return str(self.user_id)