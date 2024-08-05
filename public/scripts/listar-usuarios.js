// Função para exibir ações do usuário
function showUserActions() {
  const userActions = document.querySelector('.user-actions');
  if (userActions) {
    userActions.style.display = 'flex'; // ou 'block', dependendo do layout
  }
}

// Função para ocultar ações do usuário
function hideUserActions() {
  const userActions = document.querySelector('.user-actions');
  if (userActions) {
    userActions.style.display = 'none';
  }
}

// Função para buscar e exibir usuários
function fetchUsers(searchTerm = '') {
  // Fazer uma requisição para buscar usuários com base no termo
  fetch(`/users?search=${encodeURIComponent(searchTerm)}`)
    .then(response => response.json())
    .then(users => {
      // Atualizar a tabela com os resultados da pesquisa
      const tbody = document.getElementById('user-table-body');
      tbody.innerHTML = ''; // Limpar a tabela

      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.username || 'N/A'}</td>
          <td>${user.email}</td>
          <td>
            <button class="action-btn view-btn" data-id="${user._id}"><i class="fa fa-eye"></i></button>
            <button class="action-btn edit-btn" data-id="${user._id}"><i class="fa fa-pencil"></i></button>
            <button class="action-btn delete-btn" data-id="${user._id}"><i class="fa fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => console.error('Erro ao buscar usuários:', error));
}

// Função para abrir o modal de edição de usuário
function openEditModal(user) {
  const modal = document.getElementById('edit-modal');
  const userIdInput = document.getElementById('edit-user-id');
  const userNameInput = document.getElementById('edit-user-name');
  const userLoginInput = document.getElementById('edit-user-login');
  const userEmailInput = document.getElementById('edit-user-email');

  if (modal && userIdInput && userNameInput && userLoginInput && userEmailInput) {
    userIdInput.value = user._id || '';  // Corrigido de user.id para user._id
    userNameInput.value = user.name || '';
    userLoginInput.value = user.username || '';
    userEmailInput.value = user.email || '';

    modal.style.display = 'block';
  } else {
    console.error('Um ou mais elementos do modal não foram encontrados.');
  }
}


// Fechar o modal ao clicar no "x"
document.querySelectorAll('.close-edit').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  });
});

// Fechar o modal ao clicar fora dele
window.addEventListener('click', (event) => {
  document.querySelectorAll('.modal').forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// Evento de submissão do formulário de edição
document.getElementById('edit-user-form').addEventListener('submit', function (event) {
  event.preventDefault();
  // Lógica para salvar os dados editados
  // ...
  // Fechar o modal após salvar
  document.getElementById('edit-modal').style.display = 'none';
});







//Função para abrir o modal com os detalhes do usuário

function openViewModal(user) {
  const modal = document.getElementById('view-modal');
  const nameElement = document.getElementById('modal-name');
  const usernameElement = document.getElementById('modal-username');
  const emailElement = document.getElementById('modal-email');

  if (modal && nameElement && usernameElement && emailElement) {
    nameElement.textContent = `Nome: ${user.name}`;
    usernameElement.textContent = `Usuário: ${user.username || 'N/A'}`;
    emailElement.textContent = `Email: ${user.email}`;

    modal.style.display = 'block';
  } else {
    console.error('Um ou mais elementos do modal não foram encontrados.');
  }
}

// Fechar o modal ao clicar no "x"
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  });
});

// Fechar o modal ao clicar fora dele
window.addEventListener('click', (event) => {
  document.querySelectorAll('.modal').forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// Chama a função quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers(); // Carregar a lista de usuários inicialmente
});

// Adicionar evento para o botão de pesquisa
document.getElementById('search-btn').addEventListener('click', () => {
  const searchTerm = document.getElementById('search-user').value;
  fetchUsers(searchTerm); // Buscar usuários com o termo de pesquisa
});


// Visualizar
document.addEventListener('click', (event) => {
  if (event.target.closest('.view-btn')) {
    const userId = event.target.closest('.view-btn').dataset.id;
    // Fazer uma requisição para buscar os detalhes do usuário
    fetch(`/user/${userId}`)
      .then(response => response.json())
      .then(user => {
        openViewModal(user); // Abre o modal com os detalhes do usuário
      })
      .catch(error => console.error('Erro ao buscar detalhes do usuário:', error));
  }
});

// Editar
// Evento de clique para editar
document.addEventListener('click', (event) => {
  if (event.target.closest('.edit-btn')) {
    const userId = event.target.closest('.edit-btn').dataset.id;
    fetch(`/user/${userId}`)
      .then(response => response.json())
      .then(user => {
        openEditModal(user);
      })
      .catch(error => console.error('Erro ao buscar detalhes do usuário:', error));
  }
});


// Excluir
document.addEventListener('click', (event) => {
  if (event.target.closest('.delete-btn')) {
    const userId = event.target.closest('.delete-btn').dataset.id;
    if (confirm('Tem certeza de que deseja excluir este usuário?')) {
      // Enviar solicitação para excluir o usuário
      fetch(`/user/${userId}`, {
        method: 'DELETE'
      })
        .then(response => {
          if (!response.ok) throw new Error('Erro ao excluir usuário');
          // Atualizar a lista de usuários após a exclusão
          fetchUsers(); // Recarregar a lista de usuários
        })
        .catch(error => console.error('Erro ao excluir usuário:', error));
    }
  }
});

// Função para verificar se o ID é um ObjectId válido
function isValidObjectId(id) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

// Enviar formulário de edição de usuário
document.getElementById('edit-user-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const userId = document.getElementById('edit-user-id').value;
  const userName = document.getElementById('edit-user-name').value;
  const userLogin = document.getElementById('edit-user-login').value;
  const userEmail = document.getElementById('edit-user-email').value;

  const updatedUser = {
    name: userName,
    username: userLogin,
    email: userEmail
  };

  console.log('Atualizando usuário:', userId, updatedUser);

  fetch(`/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedUser)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(`Erro ao atualizar usuário: ${errorData.error}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Usuário atualizado com sucesso:', data);
      document.getElementById('edit-modal').style.display = 'none';
      fetchUsers();
    })
    .catch(error => {
      console.error('Erro ao atualizar usuário:', error);
    });
}); ''


// Mostrar o modal
document.getElementById('create-user').addEventListener('click', () => {
  const modal = document.getElementById('create-user-modal');
  if (modal) {
    modal.style.display = 'block';
  }
});

// Fechar o modal ao clicar no "x"
document.querySelectorAll('.close-create').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    document.getElementById('create-user-modal').style.display = 'none';
  });
});

// Fechar o modal ao clicar fora dele
window.addEventListener('click', (event) => {
  const modal = document.getElementById('create-user-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Enviar o formulário de criação de usuário
document.getElementById('create-user-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const userName = document.getElementById('create-user-name').value;
  const userEmail = document.getElementById('create-user-email').value;
  const userPassword = document.getElementById('create-user-password').value;

  const newUser = {
    name: userName,
    email: userEmail,
    password: userPassword
  };

  fetch('/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newUser)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }
      return response.json();
    })
    .then(data => {
      console.log('Usuário criado com sucesso:', data);
      document.getElementById('create-user-modal').style.display = 'none';
      // Recarregar a lista de usuários
      fetchUsers();
    })
    .catch(error => {
      console.error('Erro ao criar usuário:', error);
    });
});
