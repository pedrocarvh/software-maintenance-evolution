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
  document.getElementById('edit-user-id').value = user._id;
  document.getElementById('edit-user-name').value = user.name;
  document.getElementById('edit-user-login').value = user.username;
  document.getElementById('edit-user-email').value = user.email;

  modal.style.display = 'block';
}
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

// Criar usuários
document.getElementById('create-user').addEventListener('click', () => {
  // Redirecionar para a página de criação de usuário ou exibir um modal
  window.location.href = '/create-user'; // Substitua com o caminho correto
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
    // Fazer uma requisição para buscar os detalhes do usuário
    fetch(`/user/${userId}`)
      .then(response => response.json())
      .then(user => {
        openEditModal(user); // Abre o modal de edição do usuário
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
document.getElementById('edit-user-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const userId = document.getElementById('edit-user-id').value;
  console.log(`ID do usuário: ${userId}`); // Adicione este log para verificar o ID

  const name = document.getElementById('edit-user-name').value;
  const username = document.getElementById('edit-user-login').value;
  const email = document.getElementById('edit-user-email').value;

  const data = { name, username, email };

  fetch(`/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        alert('Usuário atualizado com sucesso');
        document.getElementById('edit-modal').style.display = 'none';
        fetchUsers(); // Recarregar a lista de usuários
      } else {
        return response.json().then(err => { throw new Error(err.error); });
      }
    })
    .catch(error => {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário: ' + error.message);
    });
});
