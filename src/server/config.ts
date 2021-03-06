export default {
    server_ip: '192.168.0.104',
    server_port: 3000,
    database: {
        name: 'DWGame',
        user: 'DWGameUser',
        password: 'password',

        scripts: {
            cUsers: `CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(20) NOT NULL,
                password VARCHAR(300) NOT NULL
            );`,
            cUserStats: `CREATE TABLE IF NOT EXISTS userStats (
                userId INT NOT NULL,
                score INT NOT NULL DEFAULT 0,
                rank INT NOT NULL DEFAULT 0,
                FOREIGN KEY (userId) REFERENCES users(id)
            );`,
            /// below are FOR future development, not in the requirements
            cUpgrades: `CREATE TABLE IF NOT EXISTS upgrades (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL,
                requiredRank INT NOT NULL
            );`,
            cUserUpgrades: `CREATE TABLE IF NOT EXISTS userUpgrades (
                userId INT NOT NULL,
                upgradeId INT NOT NULL,
                PRIMARY KEY (userId, upgradeId),
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (upgradeId) REFERENCES upgrades(id)
            )`
        }
    }
}