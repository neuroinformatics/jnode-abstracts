package jp.neuroinf.abstracts.utility;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class SigningUtilityTest {

  @ParameterizedTest
  @EnumSource(SigningUtility.AlgorithmType.class)
  void signatureVerifiesOnlyTheSignedMessage(SigningUtility.AlgorithmType type) throws Exception {
    SigningUtility signer = new SigningUtility(type);
    String signature = signer.sign("message");
    assertNotNull(signature);
    assertTrue(signer.verify("message", signature));
    assertFalse(signer.verify("massage", signature));
    assertFalse(signer.verify("message", "not base64!"));
    // a signature by another key pair does not verify
    assertFalse(new SigningUtility(type).verify("message", signature));
  }

}
