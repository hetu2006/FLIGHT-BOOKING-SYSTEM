const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return { isDone: true, isError: false, hashedPassword: hashedPassword };
  } catch (err) {
    return { isDone: false, isError: true, err: err };
  }
};

const comparePassword = async (password, dbpassword) => {
  try {
    const res = await bcrypt.compare(password, dbpassword);

    if (res) {
      return { isDone: true, isError: false, isAuthorized: true };
    } else {
      return { isDone: true, isError: false, isAuthorized: false };
    }
  } catch (err) {
    return { isDone: false, isError: true, err: err };
  }
};

module.exports = {
  encryptPassword,
  comparePassword,
};
