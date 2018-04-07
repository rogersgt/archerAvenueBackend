import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function tokenIsValid(token) {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return false;
    }
    return true;
  });
}

export function genToken(str) {
  return jwt.sign({
    data: str,
    exp: Math.floor(Date.now() / 1000) + (60 * 48) // 48 hours
  }, process.env.JWT_SECRET);
}

export function hashPassword(password){
  const hash = crypto.createHmac('sha512', process.env.HASH_STRING);
  hash.update(password);
  return hash.digest('hex');
}
