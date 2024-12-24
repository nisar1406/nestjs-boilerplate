export const MONGO_ERROR_CODES = {
  // Duplicate key errors
  11000: 409, // Duplicate key error index
  11001: 409, // Duplicate key on update

  // Interrupted operation errors
  11600: 400, // Interrupted operation
  11601: 503, // Interrupted operation - ambiguous commit token
  11602: 503, // Interrupted operation - network error occurred
  11603: 503, // Interrupted operation - shard key not unique
  11604: 503, // Interrupted operation - interrupted due to failover

  // Stale configuration errors
  13111: 503, // Stale shard configuration
  13112: 503, // Stale chunk history

  // Transaction errors
  25100: 400, // Transaction aborted
  25101: 503, // Transaction committed but timed out
  25102: 503, // Transaction too old
  25103: 503, // Incompatible transaction versions
  25104: 503, // Transaction prepare conflict
  25105: 503, // Transaction data too large

  // Write conflict errors
  112: 503, // WriteConflict

  // Authentication errors
  18: 401, // Authentication failed

  // Other errors
  2: 400, // BadValue
  13: 403, // Unauthorized
  14: 404, // TypeMismatch
  16: 503, // InternalError
  20: 503, // Overflow
  50: 503, // ExceededTimeLimit
};
