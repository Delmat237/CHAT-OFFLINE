const sequelize = require('../config/database');
const { User, Group, Message, GroupUser } = require('../models');

const resetDatabase = async () => {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        console.log('Dropping and re-syncing database...');
        // force: true drops distinct tables and re-creates them
        await sequelize.sync({ force: true });

        console.log('Database cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

resetDatabase();
