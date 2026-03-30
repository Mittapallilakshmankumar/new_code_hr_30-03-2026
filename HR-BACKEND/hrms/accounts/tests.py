from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from accounts.models import User
from common.choices import UserRole


class AdminAuthFlowTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin1",
            password="AdminPass@123",
            email="admin1@example.com",
            full_name="Admin One",
            role=UserRole.ADMIN,
            is_staff=True,
        )
        self.maker = User.objects.create_user(
            username="maker1",
            password="MakerPass@123",
            email="maker1@example.com",
            full_name="Maker One",
            role=UserRole.MAKER,
        )
        self.checker = User.objects.create_user(
            username="checker1",
            password="CheckerPass@123",
            email="checker1@example.com",
            full_name="Checker One",
            role=UserRole.CHECKER,
        )

    def test_public_registration_is_disabled(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Public User",
                "username": "publicuser",
                "email": "public@example.com",
                "role": UserRole.MAKER,
                "password": "PublicPass@123",
                "confirm_password": "PublicPass@123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.filter(username="publicuser").exists())

    def test_only_admin_can_create_user(self):
        self.client.force_authenticate(self.maker)
        response = self.client.post(
            "/api/auth/users/",
            {
                "full_name": "Checker User",
                "username": "checker1",
                "email": "checker1@example.com",
                "role": UserRole.CHECKER,
                "password": "CheckerPass@123",
                "confirm_password": "CheckerPass@123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/auth/users/",
            {
                "full_name": "Checker User",
                "username": "checker2",
                "email": "checker2@example.com",
                "role": UserRole.CHECKER,
                "password": "CheckerPass@123",
                "confirm_password": "CheckerPass@123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="checker2", role=UserRole.CHECKER).exists())

    def test_admin_can_update_user_and_reset_password(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/auth/users/{self.maker.id}/",
            {
                "full_name": "Maker One Updated",
                "role": UserRole.ADMIN,
                "is_active": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.maker.refresh_from_db()
        self.assertEqual(self.maker.full_name, "Maker One Updated")
        self.assertEqual(self.maker.role, UserRole.ADMIN)
        self.assertFalse(self.maker.is_active)
        self.assertTrue(self.maker.is_staff)

        response = self.client.post(
            f"/api/auth/users/{self.maker.id}/reset-password/",
            {
                "new_password": "NewPassword@123",
                "confirm_password": "NewPassword@123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.maker.refresh_from_db()
        self.assertTrue(self.maker.check_password("NewPassword@123"))

    def test_admin_can_create_admin_user(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/auth/users/",
            {
                "full_name": "Admin Two",
                "username": "admin2",
                "email": "admin2@example.com",
                "role": UserRole.ADMIN,
                "password": "AdminTwo@123",
                "confirm_password": "AdminTwo@123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = User.objects.get(username="admin2")
        self.assertEqual(created_user.role, UserRole.ADMIN)
        self.assertTrue(created_user.is_staff)

    def test_admin_create_user_returns_validation_errors_for_duplicates(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/auth/users/",
            {
                "full_name": "Maker One",
                "username": "maker1",
                "email": "maker1@example.com",
                "role": UserRole.MAKER,
                "password": "AnotherPass@123",
                "confirm_password": "AnotherPass@123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)
        self.assertIn("email", response.data)

    def test_maker_requesting_checker_filter_only_receives_active_checkers(self):
        self.client.force_authenticate(self.maker)
        response = self.client.get("/api/auth/users/", {"role": UserRole.CHECKER})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [item["username"] for item in response.data]
        self.assertEqual(usernames, ["checker1"])
