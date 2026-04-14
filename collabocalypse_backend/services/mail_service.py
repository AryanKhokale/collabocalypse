import smtplib
from email.message import EmailMessage
from core.config import settings


class MailService:
     def __init__(self ):
          return 
         
     def send_email_tool(
         self,
         to_email: str,
         body: str
     ) -> dict:
         
     
         try:
             msg = EmailMessage()
             msg.set_content(body)
             msg["Subject"] = 'INVITATION TO COLLABORATE ON DOCUMENT'
             msg["From"] = "collabocalypse@gmail.com"  # collabocalypse@gmail.com
             msg["To"] = to_email
     
          
             server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
             server.login("collabocalypse@gmail.com", settings.PASSWORD)
             server.send_message(msg)
             server.quit()
     
             return {"status": "success", "message": "Email sent successfully"}
     
         except Exception as e:
             return {"status": "error", "message": str(e)}
     
     
