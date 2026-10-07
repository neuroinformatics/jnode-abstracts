package jp.neuroinf.abstracts.component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Stores uploaded files (banners and figures) named by the uuid of their database row, keeping the files in step
 * with the database transaction: written files are removed again if the transaction rolls back, and files are
 * deleted only after the transaction commits.
 */
@Component
public class FileStorage {

  public void write(String directory, String name, MultipartFile file) throws ResponseStatusException {
    final File target = new File(directory, name);
    try {
      Files.createDirectories(target.getParentFile().toPath());
      file.transferTo(target.toPath());
    } catch (IOException e) {
      e.printStackTrace();
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save the file");
    }
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override
        public void afterCompletion(int status) {
          if (status != STATUS_COMMITTED) {
            deleteNow(target);
          }
        }
      });
    }
  }

  public void delete(String directory, String name) {
    final File target = new File(directory, name);
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override
        public void afterCommit() {
          deleteNow(target);
        }
      });
    } else {
      deleteNow(target);
    }
  }

  private void deleteNow(File target) {
    if (target.exists() && !target.delete()) {
      System.err.println("Failed to delete file: " + target.getPath());
    }
  }

}
