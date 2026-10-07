package jp.neuroinf.abstracts.component;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import jp.neuroinf.abstracts.support.IntegrationTest;

@IntegrationTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class FileStorageTest {

  @Autowired
  private FileStorage fileStorage;

  @Autowired
  private PlatformTransactionManager transactionManager;

  private final String directory = System.getProperty("java.io.tmpdir") + "/abstracts-test/storage";

  private final MockMultipartFile file = new MockMultipartFile("file", "f.png", "image/png", new byte[]{1});

  @Test
  void writtenFileIsRemovedOnRollback() {
    String name = UUID.randomUUID().toString();
    new TransactionTemplate(this.transactionManager).executeWithoutResult(status -> {
      this.fileStorage.write(this.directory, name, this.file);
      assertTrue(new File(this.directory, name).exists());
      status.setRollbackOnly();
    });
    assertFalse(new File(this.directory, name).exists());
  }

  @Test
  void fileIsDeletedOnlyAfterCommit() throws Exception {
    String kept = UUID.randomUUID().toString();
    String deleted = UUID.randomUUID().toString();
    Files.createDirectories(Path.of(this.directory));
    Files.write(Path.of(this.directory, kept), new byte[]{1});
    Files.write(Path.of(this.directory, deleted), new byte[]{1});
    new TransactionTemplate(this.transactionManager).executeWithoutResult(status -> {
      this.fileStorage.delete(this.directory, kept);
      status.setRollbackOnly();
    });
    assertTrue(new File(this.directory, kept).exists());
    new TransactionTemplate(this.transactionManager).executeWithoutResult(status -> {
      this.fileStorage.delete(this.directory, deleted);
      assertTrue(new File(this.directory, deleted).exists());
    });
    assertFalse(new File(this.directory, deleted).exists());
  }

}
