from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/app1/', include('app1.urls')),
    path('api/attendance/', include('attendance.urls')),

    # ✅ CHANGE THIS (IMPORTANT)
    path('api/', include('login.urls')),   # 👈 FIXED

    path('api/leave/', include('leave.urls')),

    # finance APIs
    # path('api/', include('finance.urls')),
    path('api/finance/', include('finance.urls')), 

    # auth APIs
    path('api/auth/', include('accounts.urls')),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



