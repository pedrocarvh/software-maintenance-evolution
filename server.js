if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
const dbName = 'myDatabase';
let db;
let usersCollection;

// Função para validar ObjectId
function isValidObjectId(id) {
  return ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id);
}

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB Atlas');
    db = client.db(dbName);
    usersCollection = db.collection('users');
    return true;
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB Atlas', err);
    return false;
  }
}

const getUserByEmail = async (email) => {
  return usersCollection.findOne({ email });
};

const getUserById = async (id) => {
  return usersCollection.findOne({ _id: new ObjectId(id) });
};

const createUser = async (userData) => {
  const { name, email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await usersCollection.insertOne({
    name,
    email,
    password: hashedPassword
  });
  return result.insertedId;
};

const updateUser = async (id, userData) => {
  const { name, email, password } = userData;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  const update = {
    $set: {
      name,
      email,
      ...(hashedPassword && { password: hashedPassword })
    }
  };
  await usersCollection.updateOne({ _id: new ObjectId(id) }, update);
};

const deleteUser = async (id) => {
  await usersCollection.deleteOne({ _id: new ObjectId(id) });
};

initializePassport(passport, getUserByEmail, getUserById);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/users', async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const users = await usersCollection.find({
      name: { $regex: searchTerm, $options: 'i' }
    }).toArray();
    res.json(users);
  } catch (e) {
    console.error('Erro ao buscar usuários:', e);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const user = await getUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (e) {
    console.error('Erro ao buscar detalhes do usuário:', e);
    res.status(500).json({ error: 'Erro ao buscar detalhes do usuário' });
  }
});

app.post('/user', async (req, res) => {
  try {
    const userId = await createUser(req.body);
    res.status(201).json({ id: userId });
  } catch (e) {
    console.error('Erro ao criar usuário:', e);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.put('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, username, email } = req.body;

    // Log para depuração
    console.log(`ID recebido: ${userId}`);
    console.log(`Dados recebidos: ${JSON.stringify(req.body)}`);

    // Validação simples
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e Email são obrigatórios' });
    }

    if (!isValidObjectId(userId)) {
      console.error('ID inválido:', userId);
      return res.status(400).json({ error: 'ID do usuário é inválido' });
    }

    await updateUser(userId, { name, username, email });
    res.status(200).send('Usuário atualizado com sucesso');
  } catch (e) {
    console.error('Erro ao atualizar usuário:', e);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await deleteUser(userId);
    res.status(204).send();
  } catch (e) {
    console.error('Erro ao excluir usuário:', e);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.redirect('/register?error=Email já registrado');
    }

    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword
    });

    res.redirect('/login');
  } catch (e) {
    console.error('Erro ao registrar usuário:', e);
    res.redirect('/register?error=Erro ao registrar usuário');
  }
});

app.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

// Iniciar o servidor após conectar ao MongoDB
connectToMongo().then((connected) => {
  if (connected) {
    app.listen(3000, () => {
      console.log('Servidor iniciado em http://localhost:3000');
    });
  } else {
    console.error('Falha ao conectar ao MongoDB. Servidor não iniciado.');
  }
});
