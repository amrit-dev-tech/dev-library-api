const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config(); // Loads environment variables from .env file

// Create a MySQL connection pool
const connection = mysql.createPool({
  connectionLimit: 1000,
  host: process.env.DB_HOST,     // Database host from environment variables
  user: process.env.DB_USER,     // Database user from environment variables
  password: process.env.DB_PASSWORD, // Database password from environment variables
  database: process.env.DB_NAME,     // Database name from environment variables
  charset: 'utf8mb4',            // Ensure proper charset handling
});

// Function to establish connection
const connect = () => {
  connection.getConnection((err, conn) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      return;
    }
    console.log('MySQL connected successfully!');
    conn.release();  // Always release the connection back to the pool
  });
};

// Function to execute MySQL queries
let dbHandler = {
  executeQuery: function (queryObj) {
    return new Promise((resolve, reject) => {
      const start = new Date();  // Log query start time

      // Clean up the query string by removing unnecessary spaces
      queryObj.query = queryObj.query.replace(/\s+/g, ' ');

      let finalQuery = connection.query(
        queryObj.query,            // The actual query string
        queryObj.args,             // Arguments (if any) to be passed into the query
        (err, result) => {         // Callback to handle result or error
          queryObj.sql = finalQuery.sql.replace(/[\n\t]/g, ''); // Clean query log

          if (err && (
            err.code === 'ER_LOCK_DEADLOCK' || 
            err.code === 'ER_QUERY_INTERRUPTED' || 
            err.code === 'ER_LOCK_WAIT_TIMEOUT'
          )) {
            // Retry logic for deadlock, query interruption, or timeout errors
            setTimeout(() => {
              dbHandler.executeQuery(queryObj).then(
                (result) => {
                  connection.end();  // Ensure connection ends after execution
                  resolve(result);   // Resolve with the result of the query
                },
                (error) => reject(error)  // Reject if another error happens
              );
            }, 50); // Retry after a short delay
          } else if (err) {
            // Handle any other errors
            return reject(err);
          } else {
            // If the query executes successfully, resolve with the result
            return resolve(result);
          }
        }
      );
    });
  },
};

// Export the dbHandler and connect function for external use
module.exports = { dbHandler, connect };
