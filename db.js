import mysql from 'mysql';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
const serviceUri =
  'mysql://avnadmin:AVNS_oAdoVrjlIJ8Yc5peJhX@mysql-fbdc2da-infynect.a.aivencloud.com:19331/todo?ssl-mode=REQUIRED';
const url = new URL(serviceUri);
const host = url.hostname;
const port = url.port;
const user = url.username;
const password = url.password;
const database = url.pathname.substring(1);
const sslCert = fs.readFileSync('ca.pem');
//change the password to access the local mySql database;
const db = mysql.createConnection({
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
  ssl: {
    ca: sslCert, // Replace with your CA certificate content
  },
});

export default db;
