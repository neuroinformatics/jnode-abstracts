package jp.neuroinf.abstracts.utility;

import java.security.InvalidKeyException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.SignatureException;

public class SigningUtility {

  public enum AlgorithmType {
    ED25519("Ed25519", 255, "Ed25519"),
    ECDSA("EC", 256, "SHA256withECDSA"),
    RSA("RSA", 2048, "SHA256withRSA");

    private final String keyPair;
    private final int keySize;
    private final String signature;

    private AlgorithmType(final String keyPair, int keySize, String signature) {
      this.keyPair = keyPair;
      this.keySize = keySize;
      this.signature = signature;
    }
  }

  final AlgorithmType type;
  final KeyPair pair;

  public SigningUtility(AlgorithmType algorithmType) throws NoSuchAlgorithmException {
    KeyPairGenerator gen;
    gen = KeyPairGenerator.getInstance(algorithmType.keyPair);
    gen.initialize(algorithmType.keySize, new SecureRandom());
    this.pair = gen.generateKeyPair();
    this.type = algorithmType;
  }

  public String sign(String message) {
    try {
      Signature signature = Signature.getInstance(this.type.signature);
      signature.initSign(this.pair.getPrivate());
      signature.update(StringUtility.toBytes(message));
      return StringUtility.b64encodeFromBytes(signature.sign());
    } catch (NoSuchAlgorithmException | InvalidKeyException | SignatureException e) {
      return null;
    }
  }

  public boolean verify(String message, String signedSignature) {
    try {
      Signature signature = Signature.getInstance(this.type.signature);
      signature.initVerify(this.pair.getPublic());
      signature.update(StringUtility.toBytes(message));
      return signature.verify(StringUtility.b64decodeToBytes(signedSignature));
    } catch (NoSuchAlgorithmException | InvalidKeyException | SignatureException | IllegalArgumentException e) {
      return false;
    }
  }

}
