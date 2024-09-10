package jp.neuroinf.abstracts.utility;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.regex.Pattern;

public class PasswordGenerator {

  private enum CharacterType {
    LOWER("abcdefghijklmnopqrstuvwxyz", "\\p{Lower}"),
    UPPER("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "\\p{Upper}"),
    DIGIT("1234567890", "\\p{Digit}"),
    PUNCT("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~", "\\p{Punct}");

    private final String characters;
    private final String regex;

    private CharacterType(final String characters, String regex) {
      this.characters = characters;
      this.regex = regex;
    }
  }

  private final List<CharacterType> types = new ArrayList<>(4);

  private PasswordGenerator() {
    throw new UnsupportedOperationException("Unsupported operation");
  }

  private PasswordGenerator(PasswordGeneratorBuilder builder) {
    if (builder.useLower) {
      this.types.add(CharacterType.LOWER);
    }
    if (builder.useUpper) {
      this.types.add(CharacterType.UPPER);
    }
    if (builder.useDigit) {
      this.types.add(CharacterType.DIGIT);
    }
    if (builder.usePunct) {
      this.types.add(CharacterType.PUNCT);
    }
  }

  public String generate(int length) {
    String password;
    Random random = new SecureRandom();
    if (this.types.size() > length) {
      return null;
    }
    do {
      StringBuilder buffer = new StringBuilder(length);
      for (int i = 0; i < length; i++) {
        CharacterType type = this.types.get(random.nextInt(this.types.size()));
        buffer.append(type.characters.charAt(random.nextInt(type.characters.length())));
      }
      password = new String(buffer);
    } while (!validate(password));
    return password;
  }

  public boolean validate(String password) {
    return !this.types.stream().filter((type) -> !Pattern.compile(type.regex).matcher(password).find()).findFirst()
        .isPresent();
  }

  public static class PasswordGeneratorBuilder {

    private boolean useLower = false;
    private boolean useUpper = false;
    private boolean useDigit = false;
    private boolean usePunct = false;

    public PasswordGeneratorBuilder useLower(boolean useLower) {
      this.useLower = useLower;
      return this;
    }

    public PasswordGeneratorBuilder useUpper(boolean useUpper) {
      this.useUpper = useUpper;
      return this;
    }

    public PasswordGeneratorBuilder useDigit(boolean useDigit) {
      this.useDigit = useDigit;
      return this;
    }

    public PasswordGeneratorBuilder usePunct(boolean usePunct) {
      this.usePunct = usePunct;
      return this;
    }

    public PasswordGenerator build() {
      return new PasswordGenerator(this);
    }
  }

  public static void main(String[] args) {
    PasswordGeneratorBuilder builder = new PasswordGenerator.PasswordGeneratorBuilder();
    PasswordGenerator generator = builder.useLower(true).useUpper(true).useDigit(true).usePunct(true).build();
    System.out.println(generator.generate(16));
  }

}
