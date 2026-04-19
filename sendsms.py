import smtplib
import sys
from dotenv import load_dotenv
from email.message import EmailMessage
import os

load_dotenv()
# Ensure the script received the right arguments
if len(sys.argv) < 2:
    print("Usage: python send_text.py <recipient_gateway> <message>")
    sys.exit(1)

recipient_gateway = os.getenv("PHONENUM")+"@tmomail.net"
message = sys.argv[1]

# Your credentials
sender_email = os.getenv("GMAILEMAIL")
password = os.getenv("GMAILPASSWORD")

msg = EmailMessage()
msg.set_content(' ')         # The actual text message goes in the body
msg['Subject'] = message             # A single space prevents the "(no subject)" tag on most carriers
msg['From'] = sender_email       # Satisfies spam filters
msg['To'] = recipient_gateway    # Satisfies spam filters

try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.set_debuglevel(1)
    server.starttls()
    server.login(sender_email, password)
    
    # Send the email/text
    server.sendmail(sender_email, recipient_gateway, message)
    server.quit()
    
    print("Success: Message sent!")
except Exception as e:
    # Print the error so Node.js can read it
    print(f"Error: {e}")
    sys.exit(1)