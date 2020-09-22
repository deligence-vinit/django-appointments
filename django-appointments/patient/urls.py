from django.urls import path
from . import views

urlpatterns = [
    path('patient/<uuid:id>/', views.patient_view),
    path('editPatient/<uuid:id>/',views.editPatient),
    path('passwordChange/<uuid:id>/',views.passwordChange),
    path('getwatingappointments/<uuid:id>/',views.getwatingappointments),
    path('list/<uuid:id>/',views.get_list),
]
