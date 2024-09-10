package jp.neuroinf.abstracts.component;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jp.neuroinf.abstracts.core.AppProperties;

@Component
public class EmailTemplateSender {

  private final JavaMailSender javaMailSender;
  private final AppProperties appProperties;

  @Autowired
  public EmailTemplateSender(JavaMailSender javaMailSender, AppProperties appProperties) {
    this.javaMailSender = javaMailSender;
    this.appProperties = appProperties;
  }

  public boolean send(final String to, final String subject, final String template,
      final Map<String, Object> variables) {
    final ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
    templateResolver.setTemplateMode(TemplateMode.TEXT);
    templateResolver.setCharacterEncoding("UTF-8");
    final SpringTemplateEngine engine = new SpringTemplateEngine();
    engine.setTemplateResolver(templateResolver);
    final Context context = new Context();
    variables.put("appMailFromAddress", appProperties.getMailFromAddress());
    variables.put("appMailFromName", appProperties.getMailFromName());
    context.setVariables(variables);
    final String text = engine.process(String.format("/templates/mail/%s.txt", template), context);
    final MimeMessage message = javaMailSender.createMimeMessage();
    try {
      final MimeMessageHelper messageHelper = new MimeMessageHelper(message, false);
      messageHelper.setFrom(appProperties.getMailFromAddress(), appProperties.getMailFromName());
      messageHelper.setTo(to);
      messageHelper.setSubject(subject);
      messageHelper.setText(text);
    } catch (MessagingException | UnsupportedEncodingException e) {
      e.printStackTrace();
      return false;
    }
    final boolean mock = appProperties.getMailMock();
    try {
      if (mock) {
        message.writeTo(System.out);
      } else {
        this.javaMailSender.send(message);
      }
    } catch (MailException | MessagingException | IOException e) {
      e.printStackTrace();
      return false;
    }
    return true;
  }

}
