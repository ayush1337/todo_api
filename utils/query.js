import db from '../db.js';
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
     user_id BINARY(16) PRIMARY KEY,
      user_name VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;
export const createTaskListTableQuery = `
    CREATE TABLE IF NOT EXISTS task_lists (
      task_id BINARY(16) PRIMARY KEY,
      task_name VARCHAR(255) NOT NULL,
      description TEXT,
      priority ENUM('HIGHEST', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
      status ENUM('OPEN', 'IN PROGRESS', 'COMPLETED') NOT NULL,
      start_date DATE,
      end_date DATE,
      user_id BINARY(16),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
  `;
export default query;
