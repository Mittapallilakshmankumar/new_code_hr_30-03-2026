"""
URL configuration for hrms project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path, include

# # ✅ ADD THESE (important)
# from django.conf import settings
# from django.conf.urls.static import static


# urlpatterns = [
#     path('admin/', admin.site.urls),

#     # ✅ Your app1 API
#     path('api/app1/', include('app1.urls')),
#      path('api/attendance/', include('attendance.urls')),
#      path('api/', include('login.urls')),
#      path('api/leave/', include('leave.urls')),#leave

#      path('api/', include('finance.urls')),#friend url
#       # ✅ AUTH
#     path("api/auth/", include("accounts.urls")),#frined url

# ]

# # ✅ MEDIA FILES (for image upload)
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



# from django.contrib import admin
# from django.urls import path, include

# # ✅ ADD THESE (important)
# from django.conf import settings
# from django.conf.urls.static import static


# urlpatterns = [
#     path('admin/', admin.site.urls),

#     # ✅ Your app1 API
#     path('api/app1/', include('app1.urls')),
#      path('api/attendance/', include('attendance.urls')),
#      path('api/', include('login.urls')),
#      path('api/leave/', include('leave.urls')),#leave

#      path('api/', include('finance.urls')),#friend url
#       # ✅ AUTH
#     path("api/auth/", include("accounts.urls")),#frined url

# ]

# # ✅ MEDIA FILES (for image upload)
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)





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
    path('api/login/', include('login.urls')),   # 👈 FIXED

    path('api/leave/', include('leave.urls')),

    # finance APIs
    # path('api/', include('finance.urls')),
    path('api/finance/', include('finance.urls')), 

    # auth APIs
    path('api/auth/', include('accounts.urls')),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



