Django Appointments


Docusign Appointments is a Django app for managing hospitals, doctor's & patients.
This Package comes with build in admin panel to sign and manage hospitals, Hospitals can manage doctors, confirm appointments, view appointments.
Pateints can sign up and create their profile to book appointments.
Once appointment is confirmed appointment date and time is mailed to Doctor and Patient.
Users can also regenrate passwords by password reset link.

Quick start

1. Add "crispy_forms","app" & "docusign" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'crispy_forms',
        'doctor',
        'hospital',
        'patient',
        'user',
        ...
    ]
2. Add line : AUTH_USER_MODEL='user.CustomUser'  to setting.py
3. Include the app URLconf in your project urls.py like this::

    path('', include('user.urls')),
    
4. Add SMTP server details to settings.py:-
	
	EMAIL_BACKEND ='django.core.mail.backends.smtp.EmailBackend'
	EMAIL_HOST = 'smtp.your-host.com'
	EMAIL_USE_TLS = True
	EMAIL_PORT = 587
	EMAIL_HOST_USER = 'user@your-host.com'
	EMAIL_HOST_PASSWORD = 'your-password'

5. Run ``python manage.py makemigrations`` to create the migrations.
6. Run ``python manage.py migrate`` to create the app models.
7. Run ``python manage.py createsuperuser`` to create admin username & password to login.
8. Start the development server and visit http://127.0.0.1:8000/manage/
   to manage files & settings.
9. Visit http://127.0.0.1:8000/admin/ to add hospitals.
10. Hospital can add doctors.
11. Visit http://127.0.0.1:8000/signup/ to for patient signup.
12. Visit http://127.0.0.1:8000/login/ to login for doctors, hospitals, patients.

* PyPI page: https://pypi.org/project/django-appointments/
* Bugtracker: https://github.com/deligence-vinit/django-appointments/issues
* Code repository: https://github.com/deligence-vinit/django-appointments

* For integration contact sanjay@deligence.com
