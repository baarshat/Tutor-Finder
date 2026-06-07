package com.tutor_finder.tutorfinder.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            
            helper.setFrom("thescholarsbay@gmail.com"); 
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false); 

            mailSender.send(message);
            System.out.println("✅ Email sent to " + to);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
