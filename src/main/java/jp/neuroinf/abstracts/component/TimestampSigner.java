package jp.neuroinf.abstracts.component;

import java.security.NoSuchAlgorithmException;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jp.neuroinf.abstracts.utility.SigningUtility;
import jp.neuroinf.abstracts.utility.StringUtility;

@Component
public class TimestampSigner {

  private static final String SEPARATOR = ":";
  private final SigningUtility signingUtility;

  public TimestampSigner() throws NoSuchAlgorithmException {
    this.signingUtility = new SigningUtility(SigningUtility.AlgorithmType.ED25519);
  }

  public String sign(String message) {
    String value = String.format("%s%s%d", message, SEPARATOR, now());
    String signature = this.signingUtility.sign(value);
    if (signature == null) {
      return null;
    }
    return StringUtility.b64encode(String.format("%s%s%s", value, SEPARATOR, signature));
  }

  public String unSign(String token, long duration) {
    String signedValue;
    try {
      signedValue = StringUtility.b64decode(token);
    } catch (IllegalArgumentException e) {
      // not base64, e.g. a link broken in a mail
      return null;
    }
    String[] valueSignature = StringUtility.rSplit(SEPARATOR, signedValue);
    if (valueSignature.length != 2) {
      return null;
    }
    if (!this.signingUtility.verify(valueSignature[0], valueSignature[1])) {
      return null;
    }
    String[] messageTimestamp = StringUtility.rSplit(SEPARATOR, valueSignature[0]);
    if (messageTimestamp.length != 2) {
      return null;
    }
    try {
      long now = now();
      long maxAge = Long.parseLong(messageTimestamp[1]) + duration;
      if (now > maxAge) {
        return null;
      }
    } catch (NumberFormatException e) {
      return null;
    }
    return messageTimestamp[0];
  }

  private static long now() {
    return new Date().getTime() / 1000;
  }

  public static void main(String[] args) throws Exception {
    final Logger logger = LoggerFactory.getLogger(TimestampSigner.class);
    final TimestampSigner signer = new TimestampSigner();
    String message = "hello";
    String token = signer.sign(message);
    logger.info(token);
    String ret = signer.unSign(token, 10);
    logger.info(ret);
  }
}
