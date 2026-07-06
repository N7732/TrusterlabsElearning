from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Learner, Instructor, AccountProfile

class InstructorInline(admin.StackedInline):
    model = Instructor
    can_delete = False
    verbose_name_plural = 'Instructor Profile'
    fk_name = 'user'

class LearnerInline(admin.StackedInline):
    model = Learner
    can_delete = False
    verbose_name_plural = 'Learner Profile'
    fk_name = 'user'

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_staff', 'is_active')
    list_filter = ('user_type', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('user_type',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('email', 'user_type',)}),
    )
    inlines = (InstructorInline, LearnerInline)
admin.site.site_header = "E-Learning Platform Admin"
admin.site.site_title = "E-Learning Platform Admin Portal"  
admin.site.index_title = "Welcome to E-Learning Platform Admin"

@admin.register(Learner)
class LearnerAdmin(admin.ModelAdmin):
    list_display = ['get_username', 'get_email', 'email_verified', 'phone_number', 'created_at']
    list_filter = [ 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['enrolled_courses']
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ['get_username', 'get_email', 'specialization', 'is_approved', 'created_at']
    list_filter = [ 'is_approved', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'specialization']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'



@admin.register(AccountProfile)
class AccountProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'country', 'created_at']
    list_filter = ['country', 'created_at']
    search_fields = ['user__username', 'user__email', 'city', 'country']
    readonly_fields = ['created_at', 'updated_at']



