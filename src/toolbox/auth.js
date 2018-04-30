import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function tokenIsValid(token) {
  try {
    const decoded = jwt.verify(`${token}`, process.env.JWT_SECRET);
    if (!!decoded && !!decoded.data) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function genToken(str) {
  const hoursToLive = process.env.NODE_ENV === 'production' ? 48 : 87600; // dev tokens last 10 years for tests

  return jwt.sign({
    data: str,
    exp: Math.floor(Date.now() / 1000) + (60 * hoursToLive)
  }, process.env.JWT_SECRET);
}

export function hashPassword(password){
  const hash = crypto.createHmac('sha512', process.env.HASH_STRING);
  hash.update(password);
  return hash.digest('hex');
}
