#!/usr/bin/env python
"""
Test script for Liara Email Service
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ssl import create_default_context

# Environment variables
MAIL_HOST = os.getenv("MAIL_HOST", "smtp.c1.liara.email")
MAIL_PORT = int(os.getenv("MAIL_PORT", 465))
MAIL_USER = os.getenv("MAIL_USER")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM_ADDRESS = os.getenv("MAIL_FROM_ADDRESS")
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "MechCraft Hub")

def send_email(to_address, subject, body):
    """Send email using Liara SMTP service"""
    try:
        # Enforce TLS
        context = create_default_context()

        # Connect to the server
        with smtplib.SMTP_SSL(MAIL_HOST, MAIL_PORT, context=context) as server:
            server.login(MAIL_USER, MAIL_PASSWORD)

            # Prepare the email
            msg = MIMEMultipart()
            msg['From'] = f"{MAIL_FROM_NAME} <{MAIL_FROM_ADDRESS}>"
            msg['To'] = to_address
            msg['Subject'] = subject
            msg.add_header('x-liara-tag', 'mechcraft-hub')  # Add custom header
            msg.attach(MIMEText(body, 'plain'))

            # Send the email
            server.sendmail(MAIL_FROM_ADDRESS, to_address, msg.as_string())
            print("✅ Email sent successfully!")
            return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

def send_password_reset_email(to_address, reset_link):
    """Send password reset email"""
    subject = "بازیابی رمز عبور - MechCraft Hub"
    body = f"""
سلام،

برای بازیابی رمز عبور خود، روی لینک زیر کلیک کنید:

{reset_link}

این لینک تا 24 ساعت معتبر است.

با تشکر،
تیم MechCraft Hub
"""
    return send_email(to_address, subject, body)

def send_email_verification(to_address, verification_link):
    """Send email verification"""
    subject = "تایید ایمیل - MechCraft Hub"
    body = f"""
سلام،

برای تایید ایمیل خود، روی لینک زیر کلیک کنید:

{verification_link}

با تشکر،
تیم MechCraft Hub
"""
    return send_email(to_address, subject, body)

# Example usage
if __name__ == "__main__":
    print("🧪 Testing Liara Email Service...")
    
    # Test email
    recipient = "test@example.com"
    subject = "Test Email from MechCraft Hub"
    body = "This is a test email sent from MechCraft Hub using Liara SMTP service."
    
    print(f"📧 Sending test email to: {recipient}")
    success = send_email(recipient, subject, body)
    
    if success:
        print("🎉 Email service is working correctly!")
    else:
        print("⚠️ Email service needs configuration!")
