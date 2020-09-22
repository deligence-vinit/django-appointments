from django.db import models

# Create your models here.
class Patient_Profile(models.Model):
    pt_id=models.CharField(max_length=50)
    name=models.CharField(max_length=100)
    gender=models.CharField(max_length=15)
    age=models.CharField(max_length=10)
    phone=models.CharField(max_length=20)
    address=models.TextField()
    city=models.CharField(max_length=100)
    country=models.CharField(max_length=100)

    class Meta:
        db_table='Patient'