const bcrypt = require('bcryptjs');

const password = 'password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);