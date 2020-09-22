from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse,Http404
from django.contrib.auth.decorators import login_required,user_passes_test
from django.contrib.auth.forms import PasswordResetForm
from django.contrib import messages
import uuid
from .models import Doctor_profile,time_slots,appointments
import datetime,time,os,json
from user.models import CustomUser
from hospital.models import Hospital_profile,Holidays,Weekends
from patient.models import Patient_Profile
from django.template import loader
from smtplib import SMTPException
from django.core.mail import send_mail
from django.core.mail import EmailMessage
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash,logout

mail_send_from="django_appointments@deligence.com"
BASE_DIR=os.path.dirname(os.path.abspath(__file__))
json_dir=os.path.join(BASE_DIR,"data.json")

# Create your views here.

def role_test(user):
    if user.role == "Doctor":
        return True
    else:
        return False

def role_test1(user):
    if user.role == "Hospital":
        return True
    else:
        return False

@login_required(login_url='/login/')
@user_passes_test(role_test1,login_url='/login/')
def add_doctor(request):
    if request.is_ajax():
        hospital_id=request.POST.get('hospital_id')
        name=request.POST.get('name')
        email=request.POST.get('email')
        phone=request.POST.get('phone')
        from_time=request.POST.getlist('from_time[]')
        to_time=request.POST.getlist('to_time[]')
        qualification=request.POST.get('qualification')
        speciality=request.POST.get('speciality')
        base_link=request.POST.get('link')
        doc_filter=CustomUser.objects.filter(email=email)
        if not doc_filter:
            hospital_name=list(Hospital_profile.objects.filter(id=hospital_id).values('name'))[0].get('name')
            id=uuid.uuid4()
            password = CustomUser.objects.make_random_password()
            obj=CustomUser.objects.create(id=id,email=email,role='Doctor',is_active=True,is_superuser=False,is_staff=False)
            obj.set_password(password)
            obj.save()
            doc_object=Doctor_profile.objects.create(id=id,name=name,email=email,phone=phone,qualification=qualification,speciality=speciality,hospital_id=hospital_id)
            doc_object.save()
            for i in range(len(from_time)):
                slot_obj=time_slots.objects.create(doctor_id=id,from_time=from_time[i],to_time=to_time[i])
                slot_obj.save()
            link=f"{base_link}/login/"
            html_message=loader.render_to_string('loginmail.html',
                {
                    'login':email,
                    'password':password,
                    'link':link,
                    'hospital_name':hospital_name,
                    
                })
            subject='Django Appointment System Login Details'
            try:
                mail = send_mail(subject, "Hello",mail_send_from , [email],html_message=html_message)
                message = "success"
            except SMTPException as e:
                print(f'error : {e}')
                message = e
            else:
                message = "Mail could not be sent, Please contact administrator"
            return HttpResponse('Done')
        else:
            return HttpResponse('exists')

def listDoctor(request,hos_id):
    if request.is_ajax:
        search=request.GET.get('search')
        availability=request.GET.get('availability')
        if availability:
            availability=True
            doc_obj=Doctor_profile.objects.filter(is_available=availability)
        else:
            doc_obj=Doctor_profile.objects.all()
        if search:
            doc_list=list(doc_obj.filter(hospital_id=hos_id,name__icontains=search).values('id','name','speciality','qualification','is_available'))
        else:
            doc_list=list(doc_obj.filter(hospital_id=hos_id).values('id','name','speciality','qualification','is_available'))
        return JsonResponse(doc_list,safe=False)

@login_required(login_url='/login/')
@user_passes_test(role_test1,login_url='/login/')
def editDoctor(request,id):
    if request.is_ajax:
        if request.method == 'GET':
            data=[]
            doc_obj=Doctor_profile.objects.filter(id=id).values('id','name','email','phone','qualification','speciality')
            if doc_obj:
                time_slots_obj=list(time_slots.objects.filter(doctor_id=id).values('from_time','to_time'))
                data=list(doc_obj)+time_slots_obj
            return JsonResponse(data,safe=False)
        if request.method == 'POST':
            name=request.POST.get('name-edit')
            email=request.POST.get('email-edit')
            phone=request.POST.get('phone-edit')
            from_time=request.POST.getlist('from_time[]')
            to_time=request.POST.getlist('to_time[]')
            qualification=request.POST.get('qualification-edit')
            speciality=request.POST.get('speciality-edit')
            doc_obj=Doctor_profile.objects.get(id=id)
            doc_obj.name=name
            doc_obj.email=email
            doc_obj.phone=phone
            doc_obj.from_time=from_time
            doc_obj.to_time=to_time
            doc_obj.qualification=qualification
            doc_obj.speciality=speciality
            doc_obj.save()
            time_slots_obj=time_slots.objects.filter(doctor_id=id).delete()
            for i in range(len(from_time)):
                slot_obj=time_slots.objects.create(doctor_id=id,from_time=from_time[i],to_time=to_time[i])
                slot_obj.save()
            return HttpResponse('done')


@login_required(login_url='/login/')
@user_passes_test(role_test1,login_url='/login/')
def deleteDoctor(request,id):
    if request.is_ajax:
        doc_obj=Doctor_profile.objects.get(id=id).delete()
        time_slots_obj=time_slots.objects.filter(doctor_id=id).delete()
        appointment_obj=list(appointments.objects.filter(doctor_id=id).values())
        if appointment_obj:
            for obj in appointment_obj:
                disable_appointment=appointments.objects.get(appointment_id=obj.get('appointment_id'))
                disable_appointment.is_disabled=True
                disable_appointment.save()
        return HttpResponse('Done')

@login_required(login_url='/login/')
def addAppointment(request):
    check_week_day=False
    check_holiday=False
    alloted_slot_no=None
    latest_time_alloted=''
    latest_alloted_number=''
    try:
        with open(json_dir) as f:
            data = json.load(f)
            compare_date = data.get("compare_date")
    except:
        data_upload={"compare_date": (datetime.date.today()).strftime('%Y-%m-%d'),}
        with open(json_dir, 'w') as f:
            json.dump(data_upload, f)
            f.close()
    if request.is_ajax():
        if request.method == 'POST':
            temp_start_time=[]
            temp_end_time=[]
            doc_id=request.POST.get('doctors')
            pt_id=request.POST.get('pt_id')
            book_date=request.POST.get('book_date')
            doc_obj=Doctor_profile.objects.get(id=doc_id)
            hos_id=doc_obj.hospital_id
            weekend_obj=list(Weekends.objects.filter(hos_id=hos_id).values('weekday'))
            book_day = datetime.datetime.strptime(book_date, '%Y-%m-%d').date().strftime('%A')
            check_obj=appointments.objects.filter(patient_id=pt_id,doctor_id=doc_id,date=book_date)
            if check_obj:
                return HttpResponse('exists')
            if weekend_obj:
                for week in weekend_obj:
                    if book_day == (week.get('weekday')):
                        check_week_day=True
            holidays_obj=list(Holidays.objects.filter(hos_id=hos_id).values('date'))
            cmp_holiday=datetime.datetime.strptime(book_date[5:], '%m-%d').date()
            if holidays_obj:
                for holiday in holidays_obj:
                    if cmp_holiday == datetime.datetime.strptime(holiday.get('date')[5:], '%m-%d').date():
                        check_holiday=True
            if check_week_day or check_holiday:
                return HttpResponse('holiday')
            else:     
                today = datetime.date.today()
                book_date = datetime.datetime.strptime(book_date, '%Y-%m-%d').date()
                end_date = today + datetime.timedelta(days=2)
                cmp_date= book_date + datetime.timedelta(days=2)
                if book_date <= end_date and cmp_date >= end_date:
                    # print(book_date)
                    time_slots_obj=list(time_slots.objects.filter(doctor_id=doc_id).values())
                    for time1 in time_slots_obj:
                        temp_start_time.append(time1.get('from_time'))
                        temp_end_time.append(time1.get('to_time'))
                    number_of_time_slots=len(temp_start_time)
                    query_set=list(appointments.objects.filter(date=book_date,doctor_id=doc_id,is_disabled=False,is_rejected=False).values().order_by('-created_at'))
                    if query_set:
                        latest_alloted_number = int(query_set[0].get('number_alloted'))+1
                        latest_time_alloted= query_set[0].get('time_alloted')
                    else:
                        latest_alloted_number=1
                        latest_time_alloted=temp_start_time[0]
                    with open(json_dir) as f:
                        data = json.load(f)
                        compare_date = data.get("compare_date")
                    compare_date=datetime.datetime.strptime(compare_date, '%Y-%m-%d').date()
                    if compare_date < today:
                        latest_alloted_number=1
                        latest_time_alloted=temp_start_time[0]
                        data_upload={"compare_date": (datetime.date.today()).strftime('%Y-%m-%d'),}
                        with open(json_dir, 'w') as f:
                            json.dump(data_upload, f)
                            f.close()
                    latest_time_alloted=datetime.datetime.strptime(latest_time_alloted, '%H:%M')
                    check_time_array=[]
                    for i in range(number_of_time_slots):
                        check_time=latest_time_alloted>=datetime.datetime.strptime(temp_start_time[i], '%H:%M') and latest_time_alloted <= datetime.datetime.strptime(temp_end_time[i], '%H:%M')
                        check_time_array.append(check_time)
                        if check_time == True:
                            alloted_slot_no=i
                            break
                    try:
                        check_ele=check_time_array.index(True)
                    except:
                        alloted_slot_no=0
                    cmp_end_time=datetime.datetime.strptime(temp_end_time[alloted_slot_no], '%H:%M')
                    # print(cmp_end_time)
                    if cmp_end_time < (latest_time_alloted + datetime.timedelta(minutes=30)):
                        alloted_slot_no=temp_end_time.index(str(cmp_end_time.time())[:5])
                        alloted_slot_no=alloted_slot_no+1
                        try:
                            slot_available=temp_start_time[alloted_slot_no]
                        except:
                            return HttpResponse('full')
                
                        temp=datetime.datetime.strptime(temp_start_time[alloted_slot_no], '%H:%M')
                    else:
                        temp=latest_time_alloted
                    if latest_alloted_number == 1:
                        time_alloted=str((temp).time())[:5]
                    else:
                        time_alloted=str((temp + datetime.timedelta(minutes=30)).time())[:5]
                    # print(latest_alloted_number)
                    # print(time_alloted)
                    obj=appointments.objects.create(appointment_id=uuid.uuid4(),patient_id=pt_id,doctor_id=doc_id,date=str(book_date),time_alloted=time_alloted,number_alloted=latest_alloted_number)
                    obj.save()
                    return HttpResponse('done')
    raise Http404

@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def doctor_profile(request,id):
    profile=list(Doctor_profile.objects.filter(id=id).values())
    hospital_name=list(Hospital_profile.objects.filter(id=profile[0].get('hospital_id')).values())
    return render(request,'doctor_profile.html',{'profile':profile,'hospital_name':hospital_name,'title':"Profile"})



@login_required(login_url='/login/')
@user_passes_test(role_test,login_url='/login/')
def passwordChange(request,id):
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
def view_appointments(request,id):
    date=request.GET.get('date')
    appointment_obj=list(appointments.objects.filter(doctor_id=id,date=date,is_confirmed=True,is_rejected=False,is_disabled=False).values())
    if appointment_obj:
         for obj in appointment_obj:
            pt_object=list(Patient_Profile.objects.filter(pt_id=obj.get('patient_id')).values())[0]
            obj['pateint_name']=pt_object.get('name')
            doc_object=''
            pt_object=''
    return JsonResponse(appointment_obj,safe=False)

def changestate(request,id,state):
    if state == 'available':
        doc_obj=Doctor_profile.objects.get(id=id)
        doc_obj.is_available=False
        doc_obj.save()
    elif state == 'unavailable':
        doc_obj=Doctor_profile.objects.get(id=id)
        doc_obj.is_available=True
        doc_obj.save()
    return HttpResponse('done')

@login_required(login_url='/login/')
@user_passes_test(role_test1,login_url='/login/')
def deleteAppointment(request,id):
    obj=appointments.objects.get(appointment_id=id)
    obj.delete()
    return HttpResponse('done')