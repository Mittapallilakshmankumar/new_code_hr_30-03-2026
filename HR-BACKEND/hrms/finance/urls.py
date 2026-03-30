from rest_framework.routers import DefaultRouter

from django.urls import path

from .views import (
    AdvanceViewSet,
    CheckerDashboardView,
    ExpenseViewSet,
    LedgerEntryViewSet,
    MakerDashboardView,
    NotificationViewSet,
    ReportsSummaryView,
)


router = DefaultRouter()
router.register("advances", AdvanceViewSet, basename="advance")
router.register("expenses", ExpenseViewSet, basename="expense")
router.register("ledger", LedgerEntryViewSet, basename="ledger")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("dashboard/maker/", MakerDashboardView.as_view(), name="dashboard-maker"),
    path("dashboard/checker/", CheckerDashboardView.as_view(), name="dashboard-checker"),
    path("dashboard/reports/", ReportsSummaryView.as_view(), name="dashboard-reports"),
]

urlpatterns += router.urls
