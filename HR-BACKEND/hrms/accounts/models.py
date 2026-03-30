from django.contrib.auth.models import AbstractUser
from django.db import models

from common.choices import UserRole


class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=UserRole.choices)

    def __str__(self):
        return self.username
