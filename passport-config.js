const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await getUserByEmail(email); // Busca o usuário no MongoDB
      if (user == null) {
        return done(null, false, { message: 'No user with that email' });
      }

      const match = await bcrypt.compare(password, user.password); // Compara a senha
      if (match) {
        return done(null, user); // Autenticação bem-sucedida
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e); // Trata erros de autenticação
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser)); // Configura a estratégia de autenticação

  passport.serializeUser((user, done) => done(null, user._id)); // Serializa o usuário para a sessão
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id); // Deserializa o usuário da sessão
      done(null, user);
    } catch (e) {
      done(e); // Trata erros de deserialização
    }
  });
}

module.exports = initialize;
