from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required,user_passes_test
from django.http import HttpResponse,JsonResponse
from .models import Hospital_profile,Holidays,Weekends
from django.contrib import messages
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash,logout
from doctor.models import appointments,Doctor_profile
from patient.models import Patient_Profile
from user.models import CustomUser
from django.template import loader
from smtplib import SMTPException
from django.core.mail import send_mail
from django.core.mail import EmailMessage
import datetime,time

# Create your views here.

mail_send_from="django_appointments@deligence.com"

def role_test(user):
    if user.role == "Hospital":
        return True
    else:
        return False


@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def hospital_profile(request,id):
    profile=Hospital_profile.objects.filter(id=id)
    if not profile:
        return redirect(f'/editHospital/{id}/')
    else:
        profile=list(Hospital_profile.objects.filter(id=id).values('id','name','email','country','city','beds_count','phone'))
        return render(request,'hospital_profile.html',{'profile':profile,'title':"Profile"})


@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def hospitals_edit(request,id):
    profile=list(Hospital_profile.objects.filter(id=id).values('name','email','country','city','beds_count','phone'))
    if request.method == 'POST':
        hospital_name=request.POST.get('hospital_name')
        email=request.POST.get('hos_email')
        beds_count=request.POST.get('no_of_beds')
        phone=request.POST.get('hos_phone')
        city=request.POST.get('hos_city')
        country=request.POST.get('country')
        filter_obj=Hospital_profile.objects.filter(id=id)
        if not filter_obj:
            obj=Hospital_profile.objects.create(id=id,name=hospital_name,email=email,country=country,city=city,beds_count=beds_count,phone=phone)
            obj.save()
            messages.success(request,'success')
            return redirect(f'/hospital/{id}/')
        else:
            edit_obj=Hospital_profile.objects.get(id=id)
            edit_obj.name=hospital_name
            edit_obj.email=email
            edit_obj.country=country
            edit_obj.city=city
            edit_obj.beds_count=beds_count
            edit_obj.phone=phone
            edit_obj.save()
            messages.success(request,'success')
            return redirect(f'/hospital/{id}/')
    return render(request,'hospital_edit.html',{'profile':profile,'title':'Edit Profile'})

def listHospital(request):
    if request.is_ajax():
        obj=list(Hospital_profile.objects.all().values())
        return JsonResponse(obj,safe=False)


@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def changePassword(request,id):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            logout(request)
            messages.success(request, 'changed')
            return redirect(f'/login/')
        else:
            logout(request)
            messages.error(request,'error')
            return redirect(f'/login/')

    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'change_password.html', {'form': form,'title':'Change Password'})

@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def waiting_app(request,hos_id):
    typ=request.GET.get('type')
    date=request.GET.get('date')
    doc_id_app=request.GET.get('doc')
    appointment_obj=[]
    if doc_id_app:
        temp_appointment_obj=list(appointments.objects.filter(doctor_id=doc_id_app,is_disabled=False).values())
        for app_obj in temp_appointment_obj:
            if app_obj.get('is_confirmed') == False and app_obj.get('is_rejected') == True:
                    appointment_obj.append(app_obj)
            if app_obj.get('is_confirmed') == True:
                        appointment_obj.append(app_obj)
        temp_appointment_obj=[]

    else:
        doc_obj=list(Doctor_profile.objects.filter(hospital_id=hos_id).values('id'))
        for doc in doc_obj:
            if typ == 'confirm':
                temp_appointment_obj=list(appointments.objects.filter(doctor_id=doc.get('id'),date=date,is_confirmed=False,is_rejected=False,is_disabled=False).values())
                for app_obj in temp_appointment_obj:
                    appointment_obj.append(app_obj)
            else:
                temp_appointment_obj=list(appointments.objects.filter(doctor_id=doc.get('id'),date=date,is_disabled=False).values())
                for app_obj in temp_appointment_obj:
                    if app_obj.get('is_confirmed') == False and app_obj.get('is_rejected') == True:
                        appointment_obj.append(app_obj)
                    if app_obj.get('is_confirmed') == True:
                        appointment_obj.append(app_obj)
            temp_appointment_obj=[]
            
    for obj in appointment_obj:
        doc_object=list(Doctor_profile.objects.filter(id=obj.get('doctor_id')).values())[0]
        pt_object=list(Patient_Profile.objects.filter(pt_id=obj.get('patient_id')).values())[0]
        obj['doctor_name']=doc_object.get('name')
        obj['doctor_speciality']=doc_object.get('speciality')
        obj['pateint_name']=pt_object.get('name')
        doc_object=''
        pt_object=''
    data=appointment_obj
    return JsonResponse(data,safe=False)


@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def confirm_appointments_now(request,appointment_id):
    obj=appointments.objects.get(appointment_id=appointment_id)
    doctor_obj= Doctor_profile.objects.get(id=obj.doctor_id)
    patient_obj=Patient_Profile.objects.get(pt_id=obj.patient_id)
    patient_obj1=list(CustomUser.objects.filter(id=obj.patient_id).values('email'))[0]
    html_message=loader.render_to_string('confirmation_mail.html',
                {
            'doctor_name':doctor_obj.name,
            'pateint_name':patient_obj.name,
            'time_alloted':obj.time_alloted,
            'number_alloted':obj.number_alloted,
            'date':obj.date        
                    
                })
    subject='Django Appointment: Appointment confirmed'
    try:
        mail = send_mail(subject, "Hello",mail_send_from , [doctor_obj.email,patient_obj1.get('email')],html_message=html_message)
        message = "success"
    except SMTPException as e:
        print(f'error : {e}')
    obj.is_confirmed=True
    obj.save()
    return HttpResponse('done')

@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def complete_appointments_now(request,appointment_id):
    obj=appointments.objects.get(appointment_id=appointment_id)
    obj.is_completed=True
    obj.save()
    return HttpResponse('done')

@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def reject_appointments_now(request,appointment_id):
    obj=appointments.objects.get(appointment_id=appointment_id)
    # app_obj=list(appointments.objects.filter(doctor_id=obj.doctor_id,date=obj.date).values())
    # if app_obj:
    #     for appoint in app_obj:
    #         if (datetime.datetime.strptime(obj.time_alloted, '%H:%M')) < (datetime.datetime.strptime(appoint.get('time_alloted'), '%H:%M')):
    #             app_obj_change=appointments.objects.get(appointment_id=appoint.get('appointment_id'))
    #             app_obj_change.time_alloted=str((datetime.datetime.strptime(app_obj_change.time_alloted, '%H:%M')-datetime.timedelta(minutes=30)).time())[:5]
    #             app_obj_change.save()
    obj.is_rejected=True
    obj.save()
    return HttpResponse('done')

@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def count(request,hos_id):
    appointment_obj=[]
    doc_obj=list(Doctor_profile.objects.filter(hospital_id=hos_id).values('id'))    
    pending_count=0
    for doc in doc_obj:
        temp_pending_count=appointments.objects.filter(doctor_id=doc.get('id'),is_confirmed=False,is_rejected=False).count()
        pending_count=pending_count+temp_pending_count

    for doc in doc_obj:
        temp_appointment_obj=list(appointments.objects.filter(doctor_id=doc.get('id'),is_disabled=False).values())   
        for app_obj in temp_appointment_obj:
            if app_obj.get('is_confirmed') == False and app_obj.get('is_rejected') == True:
                    appointment_obj.append(app_obj)
            if app_obj.get('is_confirmed') == True:
                    appointment_obj.append(app_obj)
    view_count=len(appointment_obj)
    available_doctor_count=Doctor_profile.objects.filter(hospital_id=hos_id,is_available=True).count()   
    return JsonResponse([{'pending_count':pending_count},{'view_count':view_count},{'available_doctor_count':available_doctor_count}],safe=False)


def addHoliday(request,id):
    if request.method == 'POST':
        sunday=request.POST.get('sunday')
        monday=request.POST.get('monday')
        tuesday=request.POST.get('tuesday')
        wednesday=request.POST.get('wednesday')
        thursday=request.POST.get('thursday')
        friday=request.POST.get('friday')
        saturday=request.POST.get('saturday')
        day=[sunday,monday,tuesday,wednesday,thursday,friday,saturday]
        date=request.POST.getlist('date[]')
        weekend_obj=list(Weekends.objects.filter(hos_id=id).values())
        holidays_obj=list(Holidays.objects.filter(hos_id=id).values())
        if weekend_obj:
            for week in weekend_obj:
                weekend_obj1=Weekends.objects.get(id=week.get('id'))
                weekend_obj1.delete()
        if holidays_obj:
            for holi in holidays_obj:
                holidays_obj1=Holidays.objects.get(id=holi.get('id'))
                holidays_obj1.delete()
        for week1 in day:
            if week1 != None:    
                weekend_obj2=Weekends.objects.create(weekday=week1,hos_id=id)
                weekend_obj2.save()
        for data in date:
            holidays_obj2=Holidays.objects.create(date=data,hos_id=id)
            holidays_obj2.save()
        return HttpResponse('done')

    elif request.method == 'GET':
        weekend_obj=list(Weekends.objects.filter(hos_id=id).values())
        holidays_obj=list(Holidays.objects.filter(hos_id=id).values())
        return JsonResponse([weekend_obj,holidays_obj],safe=False)