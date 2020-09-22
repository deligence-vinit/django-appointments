from django.urls import path,include
from . import views

urlpatterns = [
    path('reset/<uidb64>/<token>/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password_reset/',views.password_reset),
    path('passwordChanged/',views.pass_changed_success,name='changed' ),
    path('login/', views.manage),
    path('signup/',views.patient_signup),
    path('logout/',views.logout_request),
    path('check_username/',views.check_username),
    path('confirmAccount/<uuid:id>',views.confirmAccount),
    path('',include('hospital.urls')),
    path('',include('doctor.urls')),
    path('',include('patient.urls')),
]
