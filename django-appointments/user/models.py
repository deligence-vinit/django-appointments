from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.utils.translation import gettext_lazy as _

# Create your models here.
class CustomUser(AbstractUser):
    id=models.UUIDField( primary_key = True, editable = False,default=uuid.uuid4()) 
    role=models.CharField(max_length=10,choices=[('Hospital', 'Hospital'), ('Patient', 'Patient')])
    username = None
    is_active=models.BooleanField(default=True)
    USERNAME_FIELD = 'email'
    email = models.EmailField(_('email address'), unique=True) # changes email to unique and blank to false
    REQUIRED_FIELDS = [] # removes email from REQUIRED_FIELDS
    class Meta:
        db_table='User'
        verbose_name_plural='Users'
        