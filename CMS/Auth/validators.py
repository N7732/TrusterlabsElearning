import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(_('Password must be at least 8 characters long.'), code='password_too_short')
        if not re.search(r'[A-Za-z]', password):
            raise ValidationError(_('Password must contain at least one letter.'), code='password_no_letter')
        if not re.search(r'\d', password):
            raise ValidationError(_('Password must contain at least one number.'), code='password_no_number')
        if not re.search(r'[^A-Za-z0-9]', password):
            raise ValidationError(_('Password must contain at least one symbol.'), code='password_no_symbol')

    def get_help_text(self):
        return _('Your password must be at least 8 characters long, contain at least one letter, one number, and one symbol.')
