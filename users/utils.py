from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
import random
import logging

logger = logging.getLogger(__name__)


def generate_otp():
    """Generate a 6-digit OTP"""
    otp=str(random.randint(100000, 999999))
    print(f"[DEBUG] Generated OTP: {otp}")
    return otp


def send_otp_email(email, otp, user_name=None):
    """
    Send OTP verification email to the user.
    
    Args:
        email: User's email address
        otp: The OTP code to send
        user_name: Optional user name for personalization
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    subject = 'Verify Your Email - Events Platform'
    
    # Plain text version
    plain_message = f"""
Hello{' ' + user_name if user_name else ''},

Thank you for registering with Events Platform!

Your OTP verification code is: {otp}

This code will expire in {getattr(settings, 'OTP_EXPIRY_MINUTES', 5)} minutes.

If you didn't request this code, please ignore this email.

Best regards,
Events Platform Team
    """
    
    # HTML version
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }}
        .content {{
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }}
        .otp-code {{
            background-color: #4F46E5;
            color: white;
            font-size: 32px;
            font-weight: bold;
            padding: 15px 30px;
            border-radius: 8px;
            display: inline-block;
            letter-spacing: 5px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Events Platform</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email</h2>
            <p>Hello{' ' + user_name if user_name else ''},</p>
            <p>Thank you for registering with Events Platform! Please use the following OTP to verify your email address:</p>
            
            <div style="text-align: center;">
                <div class="otp-code">{otp}</div>
            </div>
            
            <p><strong>This code will expire in {getattr(settings, 'OTP_EXPIRY_MINUTES', 5)} minutes.</strong></p>
            
            <p>If you didn't request this code, please ignore this email.</p>
            
            <p>Best regards,<br>Events Platform Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    """
    
    try:
        # Try sending HTML email
        email_message = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        email_message.attach_alternative(html_message, "text/html")
        email_message.send(fail_silently=False)
        
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        # For development, print OTP to console as fallback
        print(f"[DEV] OTP for {email}: {otp}")
        return False


def send_welcome_email(email, user_name=None):
    """
    Send welcome email after successful verification.
    """
    subject = 'Welcome to Events Platform!'
    
    plain_message = f"""
Hello{' ' + user_name if user_name else ''},

Your email has been verified successfully!

You can now log in and start exploring events or create your own.

Best regards,
Events Platform Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {str(e)}")
        return False
