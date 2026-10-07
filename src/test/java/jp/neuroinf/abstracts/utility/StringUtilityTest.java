package jp.neuroinf.abstracts.utility;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class StringUtilityTest {

  @Test
  void rSplitSplitsAtTheLastSeparator() {
    assertArrayEquals(new String[]{"a:b", "c"}, StringUtility.rSplit(":", "a:b:c"));
    assertArrayEquals(new String[]{"a", ""}, StringUtility.rSplit(":", "a:"));
    assertArrayEquals(new String[]{"abc"}, StringUtility.rSplit(":", "abc"));
    assertArrayEquals(new String[]{"a", "b"}, StringUtility.rSplit("::", "a::b"));
  }

  @Test
  void base64RoundTripsUtf8Text() {
    String text = "抄録 abstract ü";
    assertEquals(text, StringUtility.b64decode(StringUtility.b64encode(text)));
    assertEquals("aGVsbG8=", StringUtility.b64encode("hello"));
  }

  @Test
  void invalidBase64IsRejected() {
    assertThrows(IllegalArgumentException.class, () -> StringUtility.b64decode("not base64!"));
  }

}
