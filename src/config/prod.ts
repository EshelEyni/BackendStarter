export default {
  note: "No actual secrets here!",
  dbURL: process.env.MONGO_DB_URL,
  sessionKey: process.env.SESSION_KEY,
  jwtSecretCode: process.env.JWT_SECRET_CODE,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME,
};
