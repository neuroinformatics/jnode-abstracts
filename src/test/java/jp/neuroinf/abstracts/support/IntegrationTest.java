package jp.neuroinf.abstracts.support;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

/**
 * Runs the application against an in-memory database. The properties override any application.properties in the
 * working directory, so that tests never touch a real database or send mails.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Import(TestData.class)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:abstracts-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=false",
    "logging.level.org.hibernate.SQL=INFO",
    "logging.level.org.hibernate.orm.jdbc.bind=INFO",
    "app.url=http://localhost:8080",
    "app.admins=" + TestData.ADMIN_MAIL,
    "app.path.banners=${java.io.tmpdir}/abstracts-test/banners",
    "app.path.figures=${java.io.tmpdir}/abstracts-test/figures",
    "app.mail.mock=true",
})
public @interface IntegrationTest {
}
