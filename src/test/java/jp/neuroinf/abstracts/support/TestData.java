package jp.neuroinf.abstracts.support;

import java.time.LocalDateTime;

import org.springframework.boot.test.context.TestComponent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractGroup;
import jp.neuroinf.abstracts.entity.AbstractOwners;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.ConferenceOwners;
import jp.neuroinf.abstracts.repository.AbstractRepository;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

/**
 * Creates entities for tests.
 */
@TestComponent
public class TestData {

  public static final String ADMIN_MAIL = "admin@example.com";

  private final AccountRepository accountRepository;
  private final ConferenceRepository conferenceRepository;
  private final AbstractRepository abstractRepository;
  private final PasswordEncoder passwordEncoder;

  public TestData(AccountRepository accountRepository, ConferenceRepository conferenceRepository,
      AbstractRepository abstractRepository, PasswordEncoder passwordEncoder) {
    this.accountRepository = accountRepository;
    this.conferenceRepository = conferenceRepository;
    this.abstractRepository = abstractRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public static RequestPostProcessor login(Account account) {
    return user(new AccountDetails(account));
  }

  public Account account(String mail) {
    Account account = new Account();
    account.setMail(mail);
    account.setPassword(this.passwordEncoder.encode("password"));
    account.setFirstName("First");
    account.setLastName(mail.substring(0, mail.indexOf('@')));
    account.setIsActive(true);
    return this.accountRepository.saveAndFlush(account);
  }

  public Account admin() {
    return account(ADMIN_MAIL);
  }

  public Conference conference(String shortName, Account owner) {
    Conference conference = new Conference();
    conference.setIsOpen(true);
    conference.setIsPublished(true);
    conference.setIsActive(true);
    conference.setName("Conference " + shortName);
    conference.setShortName(shortName);
    conference.setStartDate(LocalDateTime.of(2026, 11, 1, 0, 0));
    conference.setEndDate(LocalDateTime.of(2026, 11, 3, 0, 0));
    conference.setDeadline(LocalDateTime.of(2026, 10, 15, 0, 0));
    conference.setHasPresentationPrefs(false);
    conference.setAbstractMaxLength(2000);
    conference.setAbstractMaxFigures(1);
    if (owner != null) {
      ConferenceOwners conferenceOwner = new ConferenceOwners();
      conferenceOwner.setConference(conference);
      conferenceOwner.setOwner(owner);
      conference.getConferenceOwners().add(conferenceOwner);
    }
    return this.conferenceRepository.saveAndFlush(conference);
  }

  public AbstractGroup abstractGroup(Conference conference, int prefix, String shortName) {
    AbstractGroup abstractGroup = new AbstractGroup();
    abstractGroup.setPrefix(prefix);
    abstractGroup.setName("Group " + shortName);
    abstractGroup.setShortName(shortName);
    abstractGroup.setConference(conference);
    conference.getAbstractGroups().add(abstractGroup);
    this.conferenceRepository.saveAndFlush(conference);
    return conference.getAbstractGroups().stream().filter(g -> g.getShortName().equals(shortName)).findFirst()
        .orElseThrow();
  }

  public Abstract abstract_(Conference conference, Account owner, AbstractState state) {
    Abstract abstract_ = new Abstract();
    abstract_.setTitle("Title");
    abstract_.setText("Text");
    abstract_.setSortId(0);
    abstract_.setState(state.getValue());
    abstract_.setConference(conference);
    if (owner != null) {
      AbstractOwners abstractOwner = new AbstractOwners();
      abstractOwner.setAbstract_(abstract_);
      abstractOwner.setOwner(owner);
      abstract_.getAbstractOwners().add(abstractOwner);
    }
    Abstract saved = this.abstractRepository.saveAndFlush(abstract_);
    conference.getAbstracts().add(saved);
    return saved;
  }

}
