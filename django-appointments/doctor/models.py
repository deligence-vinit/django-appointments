from django.db import models

# Create your models here.

class Doctor_profile(models.Model):
     id=models.UUIDField( primary_key = True, editable = False)
     name=models.CharField(max_length=100)
     email=models.CharField(max_length=100)
     phone=models.CharField(max_length=100)
     qualification= models.CharField(max_length=100)
     speciality= models.CharField(max_length=200)
     hospital_id=models.CharField(max_length=100)
     is_available=models.BooleanField(default=True)

     class Meta:
         db_table='Doctor'


class time_slots(models.Model):
    doctor_id=models.CharField(max_length=100)
    from_time=models.CharField(max_length=10)
    to_time=models.CharField(max_length=10)

    class Meta:
        db_table='time_slots'

class appointments(models.Model):
    appointment_id=models.UUIDField(primary_key=True)
    patient_id=models.CharField(max_length=100)
    doctor_id=models.CharField(max_length=100)
    date=models.CharField(max_length=50)
    time_alloted=models.CharField(max_length=50)
    number_alloted=models.CharField(max_length=50)
    is_completed=models.BooleanField(default=False)
    is_confirmed=models.BooleanField(default=False)
    is_rejected=models.BooleanField(default=False)
    is_disabled=models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at=models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        get_latest_by='created_at'
