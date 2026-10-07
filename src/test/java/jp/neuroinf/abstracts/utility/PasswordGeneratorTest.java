package jp.neuroinf.abstracts.utility;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class PasswordGeneratorTest {

  private static PasswordGenerator all() {
    return new PasswordGenerator.PasswordGeneratorBuilder().useLower(true).useUpper(true).useDigit(true)
        .usePunct(true).build();
  }

  @Test
  void generatedPasswordsUseEveryCharacterType() {
    PasswordGenerator generator = all();
    for (int i = 0; i < 100; i++) {
      String password = generator.generate(16);
      assertEquals(16, password.length());
      assertTrue(generator.validate(password), password);
    }
    assertNotEquals(generator.generate(16), generator.generate(16));
  }

  @Test
  void selectedCharacterTypesOnly() {
    PasswordGenerator digits = new PasswordGenerator.PasswordGeneratorBuilder().useDigit(true).build();
    assertTrue(digits.generate(8).matches("\\d{8}"));
  }

  @Test
  void validateRequiresEveryType() {
    PasswordGenerator generator = all();
    assertTrue(generator.validate("aA1!"));
    assertFalse(generator.validate("aA1a"));
    assertFalse(generator.validate("abcdefgh"));
  }

  @Test
  void tooShortForAllTypes() {
    assertNull(all().generate(3));
  }

}
