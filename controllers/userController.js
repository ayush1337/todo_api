import query from '../utils/query.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    const selectUserQuery = `
      SELECT * FROM users 
      WHERE user_name = ?;
    `;
    const users = await query(selectUserQuery, [user_name]);

    if (users.length === 0) {
      res.status(404).send('User not found');
      return;
    }
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign(
      { user_id: user.user_id.toString('hex'), user_name: user.user_name },
      'mysecret',
      {
        expiresIn: '100y',
      }
    );
    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send('Error logging in user');
  }
};

export const register = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const insertUserQuery = `
      INSERT INTO users (user_id, user_name, password) 
      VALUES (UUID_TO_BIN(UUID()), ?, ?)
    `;
    await query(insertUserQuery, [user_name, passwordHash]);
    res.status(201).send('User Registered');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).send('User name already exists');
    } else {
      res.status(500).send('Error registering user');
    }
  }
};
