package jp.neuroinf.abstracts.utility;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class StringUtility {

  public static String[] rSplit(String pattern, String string) throws IllegalArgumentException {
    int pos = string.lastIndexOf(pattern);
    if (pos < 0) {
      return new String[] { string };
    }
    return new String[] { string.substring(0, pos), string.substring(pos + pattern.length()) };
  }

  public static String b64encodeFromBytes(byte[] value) {
    return Base64.getEncoder().encodeToString(value);
  }

  public static byte[] b64decodeToBytes(String value) {
    return Base64.getDecoder().decode(value);
  }

  public static String b64encode(String value) {
    return b64encodeFromBytes(toBytes(value));
  }

  public static String b64decode(String value) {
    return toString(b64decodeToBytes(value));
  }

  public static byte[] toBytes(String value) {
    return value.getBytes(StandardCharsets.UTF_8);
  }

  public static String toString(byte[] value) {
    return new String(value);
  }

}
