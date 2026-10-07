package jp.neuroinf.abstracts.component;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

import jp.neuroinf.abstracts.utility.StringUtility;

class TimestampSignerTest {

  @Test
  void signedMessageIsRestored() throws Exception {
    TimestampSigner signer = new TimestampSigner();
    assertEquals("user@example.com", signer.unSign(signer.sign("user@example.com"), 60));
    // the separator may also appear in the message
    assertEquals("a:b", signer.unSign(signer.sign("a:b"), 60));
  }

  @Test
  void expiredTokenIsRejected() throws Exception {
    TimestampSigner signer = new TimestampSigner();
    assertNull(signer.unSign(signer.sign("user@example.com"), -1));
  }

  @Test
  void tamperedOrForeignTokensAreRejected() throws Exception {
    TimestampSigner signer = new TimestampSigner();
    String token = signer.sign("user@example.com");
    String decoded = StringUtility.b64decode(token);
    String tampered = StringUtility.b64encode(decoded.replace("user@", "admin@"));
    assertNull(signer.unSign(tampered, 60));
    // tokens of another instance (e.g. before a restart) do not verify
    assertNull(new TimestampSigner().unSign(token, 60));
  }

  @Test
  void malformedTokensAreRejected() throws Exception {
    TimestampSigner signer = new TimestampSigner();
    assertNull(signer.unSign(StringUtility.b64encode("no separator"), 60));
    assertNull(signer.unSign("not base64!", 60));
  }

}
