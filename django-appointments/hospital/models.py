from django.db import models

# Create your models here.

class Hospital_profile(models.Model):
     id=models.UUIDField( primary_key = True, editable = False)
     name=models.CharField(max_length=100)
     email=models.CharField(max_length=100)
     country=models.CharField(max_length=100)
     city=models.CharField(max_length=100)
     beds_count=models.CharField(max_length=50)
     phone=models.CharField(max_length=100)
     city=models.CharField(max_length=100)

     class Meta:
         db_table='Hospital'


class Holidays(models.Model):
    date=models.CharField(max_length=50)
    hos_id=models.CharField(max_length=70)
    class Meta:
        db_table='Holidays'

class Weekends(models.Model):
    weekday=models.CharField(max_length=50)
    hos_id=models.CharField(max_length=70)
    class Meta:
        db_table='Weekends'