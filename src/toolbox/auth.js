import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function authToken(token) {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return Promise.reject('Unauthorized');
    }
    return Promise.resolve(decoded);
  });
}

export async function genToken(str) {
  return jwt.sign({
    data: str
  }, {
    expiresIn: '48h'
  });
}

export function hashPassword(password){
  const hash = crypto.createHmac('sha512', process.env.HASH_STRING);
  hash.update(password);
  return hash.digest('hex');
}
