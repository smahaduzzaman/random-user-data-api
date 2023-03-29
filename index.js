const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
// const faker = require('faker');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// function generateRandomUserData() {
//     const id = faker.datatype.uuid();
//     const gender = faker.random.arrayElement(['male', 'female']);
//     const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
//     const contact = faker.phone.phoneNumber();
//     const address = faker.address.streetAddress();
//     const photoUrl = faker.image.avatar();
//     return {
//         id,
//         gender,
//         name,
//         contact,
//         address,
//         photoUrl,
//     };
// }

// Routes
app.get('/user/random', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const randomUser = users[Math.floor(Math.random() * users.length)];
        res.json(randomUser);
    });
});

app.get('/user/all', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        console.log(users);
        const limit = req.query.limit;
        if (limit) {
            res.json(users.slice(0, limit));
        } else {
            res.json(users);
        }
    });
});

app.post('/user/save', (req, res) => {
    const { gender, name, contact, address, photoUrl } = req.body;
    if (!gender || !name || !contact || !address || !photoUrl) {
        return res.status(400).json({ message: 'Missing required properties' });
    }
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const newUser = { id: uuidv4(), gender, name, contact, address, photoUrl };
        users.push(newUser);
        fs.writeFile('users.json', JSON.stringify(users), (err) => {
            if (err) throw err;
            res.json(newUser);
        });
    });
});

app.patch('/user/update/:id', (req, res) => {
    const { gender, name, contact, address, photoUrl } = req.body;
    if (!gender && !name && !contact && !address && !photoUrl) {
        return res.status(400).json({ message: 'Missing properties to update' });
    }
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const userId = req.params.id;
        const userToUpdate = users.find((user) => user.id === userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (gender) userToUpdate.gender = gender;
        if (name) userToUpdate.name = name;
        if (contact) userToUpdate.contact = contact;
        if (address) userToUpdate.address = address;
        if (photoUrl) userToUpdate.photoUrl = photoUrl;
        fs.writeFile('users.json', JSON.stringify(users), (err) => {
            if (err) throw err;
            res.json(userToUpdate);
        });
    });
});

app.patch('/user/bulk-update', (req, res) => {
    const { ids, gender, name, contact, address, photoUrl } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: 'Missing or invalid ids array' });
    }
    if (!gender && !name && !contact && !address && !photoUrl) {
        return res.status(400).json({ message: 'Missing properties to update' });
    }
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const usersToUpdate = users.filter((user) => ids.includes(user.id));
        if (usersToUpdate.length !== ids.length) {
            return res.status(404).json({ message: 'One or more users not found' });
        }
        usersToUpdate.forEach((user) => {
            if (gender) user.gender = gender;
            if (name) user.name = name;
            if (contact) user.contact = contact;
            if (address) user.address = address;
            if (photoUrl) user.photoUrl = photoUrl;
        });
        fs.writeFile('users.json', JSON.stringify(users), (err) => {
            if (err) throw err;
            res.json(usersToUpdate);
        });
    });
});

app.delete('/user/delete/:id', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const userId = req.params.id;
        const filteredUsers = users.filter((user) => user.id !== userId);
        if (filteredUsers.length === users.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        fs.writeFile('users.json', JSON.stringify(filteredUsers), (err) => {
            if (err) throw err;
            res.json({ message: 'User deleted successfully' });
        });
    });
});

app.delete('/user/bulk-delete', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: 'Missing or invalid ids array' });
    }
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const filteredUsers = users.filter((user) => !ids.includes(user.id));
        if (filteredUsers.length === users.length) {
            return res.status(404).json({ message: 'One or more users not found' });
        }
        fs.writeFile('users.json', JSON.stringify(filteredUsers), (err) => {
            if (err) throw err;
            res.json({ message: 'Users deleted successfully' });
        });
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
})

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});