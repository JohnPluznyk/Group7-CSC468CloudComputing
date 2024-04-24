USE FusionBank;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS bankingInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank varchar(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

GRANT ALL PRIVILEGES ON FusionBank.users TO 'john'@'%';
GRANT ALL PRIVILEGES ON FusionBank.bankingInfo TO 'john'@'%';
GRANT ALL PRIVILEGES ON FusionBank.data TO 'john'@'%';

