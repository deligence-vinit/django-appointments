from django.shortcuts import redirect,render
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout,update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.forms import PasswordResetForm,SetPasswordForm
from .models import CustomUser
import json,os
from django.http import HttpResponse,Http404,FileResponse
from django.contrib import messages
from django.core.mail import send_mail
from django.core.mail import EmailMessage
from smtplib import SMTPException
from django.http import HttpResponse
from django.template import loader
from django.http import HttpResponseRedirect
import uuid
from django.views.generic.edit import FormView
from django.urls import reverse_lazy
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.http import (
    url_has_allowed_host_and_scheme, urlsafe_base64_decode,
)
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.translation import gettext_lazy as _
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.views import PasswordContextMixin
import re
mail_send_from="django_appointments@deligence.com"

UserModel = get_user_model()
INTERNAL_RESET_SESSION_TOKEN = '_password_reset_token'

# Create your views here.

def manage(request):
    if request.method == 'POST':
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(email=username, password=password)
            if user is not None:
                obj=CustomUser.objects.get(email=username)
                if obj.is_active:
                    if obj.role == 'Patient':
                        login(request, user)
                        return redirect(f'/patient/{obj.id}/')
                    if obj.role == 'Hospital':
                        login(request, user)
                        return redirect(f'/hospital/{obj.id}/')
                    if obj.role == 'Doctor':
                        login(request, user)
                        return redirect(f'/doctor/{obj.id}/')
                    else:
                        return redirect('/notfound/')
                else:
                    messages.error(request, "Confirm your Email-Id first")
            else:
                messages.error(request, "Invalid Email-Id or password.")
        else:
            messages.error(request, "Invalid Email-Id or password.")
    form = AuthenticationForm()
    return render(request=request,
                  template_name="login.html",
                  context={"form": form,'title':'Login'})


@login_required(login_url='/login/')
def logout_request(request):
    logout(request)
    messages.info(request, "Logged out successfully!")
    return redirect('/login/')


def patient_signup(request):
    if request.method == 'POST':
        email=request.POST.get('email')
        password=request.POST.get('password')
        id=uuid.uuid4()
        base_link=request.POST.get('link')
        obj=CustomUser.objects.create(id=id,email=email,role='Patient',is_active=False,is_superuser=False,is_staff=False)
        obj.set_password(password)
        obj.save()
        link=f"{base_link}/confirmAccount/{id}"
        html_message=loader.render_to_string('mail.html',
            {
                'link':link,
                
            })
        subject='Confirm you Mail-Id'
        try:
            mail = send_mail(subject, "Hello",mail_send_from , [email],html_message=html_message)
            message = "success"
        except SMTPException as e:
            print(f'error  : {e}')
            message = e
        else:
            message = "Mail could not be sent, Please contact administrator"
        messages.success(request, "Please check your mail & confirm")

    return render(request,'signup.html',{'title':'Signup'})

@csrf_exempt
def check_username(request):
    if request.is_ajax():
        email=request.POST.get('username')
        obj=CustomUser.objects.filter(email=email)
        if obj:
            return HttpResponse(json.dumps({'status': 'exists'}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({'status': 'available'}), content_type="application/json")

def confirmAccount(request,id):
    try:
        obj=CustomUser.objects.get(id=id)
        if not (obj.is_active):
            obj.is_active=True
            obj.save()
            messages.success(request, "Email confirmed, Please login")
            return redirect('/login/')
        else:
            messages.error(request, "Not Found")
            return redirect('/login/')
    except:
        messages.error(request, "Not Found")
        return redirect('/login/')


def password_reset(request):
    form = PasswordResetForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            form.save(from_email='django_appointments@appointments.com',request=request)
            messages.success(request, "link sent")
            return redirect('/login/')
        else:
            return HttpResponse("Invalid Request")
    else:
        form=PasswordResetForm()
        return render(request,'password_reset_form.html',{'form': form,'title':'Password Reset'})

def pass_changed_success(request):
    messages.success(request, "changed")
    return redirect('/login/')

class PasswordResetConfirmView(PasswordContextMixin, FormView):
    form_class = SetPasswordForm
    post_reset_login = False
    post_reset_login_backend = None
    reset_url_token = 'set-password'
    success_url = reverse_lazy('changed')
    template_name = 'password_reset_confirm.html'
    title = _('Enter new password')
    token_generator = default_token_generator

    @method_decorator(sensitive_post_parameters())
    @method_decorator(never_cache)
    def dispatch(self, *args, **kwargs):
        assert 'uidb64' in kwargs and 'token' in kwargs

        self.validlink = False
        self.user = self.get_user(kwargs['uidb64'])

        if self.user is not None:
            token = kwargs['token']
            if token == self.reset_url_token:
                session_token = self.request.session.get(INTERNAL_RESET_SESSION_TOKEN)
                if self.token_generator.check_token(self.user, session_token):
                    # If the token is valid, display the password reset form.
                    self.validlink = True
                    return super().dispatch(*args, **kwargs)
            else:
                if self.token_generator.check_token(self.user, token):
                    # Store the token in the session and redirect to the
                    # password reset form at a URL without the token. That
                    # avoids the possibility of leaking the token in the
                    # HTTP Referer header.
                    self.request.session[INTERNAL_RESET_SESSION_TOKEN] = token
                    redirect_url = self.request.path.replace(token, self.reset_url_token)
                    return HttpResponseRedirect(redirect_url)

        # Display the "Password reset unsuccessful" page.
        return self.render_to_response(self.get_context_data())

    def get_user(self, uidb64):
        try:
            # urlsafe_base64_decode() decodes to bytestring
            uid = urlsafe_base64_decode(uidb64).decode()
            user = UserModel._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist, ValidationError):
            user = None
        return user

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.user
        return kwargs

    def form_valid(self, form):
        user = form.save()
        del self.request.session[INTERNAL_RESET_SESSION_TOKEN]
        if self.post_reset_login:
            auth_login(self.request, user, self.post_reset_login_backend)
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.validlink:
            context['validlink'] = True
        else:
            context.update({
                'form': None,
                'title': _('Password reset unsuccessful'),
                'validlink': False,
            })
        return context

