from django.urls import path
from . import views


urlpatterns = [
    path('addDoctor/', views.add_doctor),
    path('listDoctor/<uuid:hos_id>/',views.listDoctor),
    path('editDoctor/<uuid:id>/',views.editDoctor),
    path('deleteDoctor/<uuid:id>/',views.deleteDoctor),
    path('changestate/<uuid:id>/<str:state>/',views.changestate),
    path('addAppointment/',views.addAppointment),
    path('doctor/<uuid:id>/',views.doctor_profile),
    path('todayAppointments/<uuid:id>/',views.view_appointments),
    path('changePasswordDoctor/<uuid:id>/',views.passwordChange),
    path('deleteAppointment/<uuid:id>/',views.deleteAppointment),
]
