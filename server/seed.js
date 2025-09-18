require('dotenv').config();
const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');

(async () => {
  try {
    await sequelize.sync();

    const adminEmail = 'admin@technotool.local';
    const existing = await User.findOne({ where: { email: adminEmail } });
    if (existing) {
      console.log('Admin already exists:', adminEmail);
      process.exit(0);
    }

    const hash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Administrator',
      email: adminEmail,
      passwordHash: hash,
      role: 'admin'
    });

    console.log('Created admin:', admin.email, 'password: admin123 — change this!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();