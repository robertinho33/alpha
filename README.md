Comércios do Meu Bairro
Um sistema escalável para gerenciar comércios locais, com funcionalidades de login, configuração, atendimentos, agendamentos, e dashboard. Construído com HTML, Bootstrap 5.3.3, JavaScript (ES6), e Firebase 11.6.0.
Estrutura do Projeto
/comercios-do-meu-bairro
  /public
    /assets
      /css/styles.css
      /images/logo.png
    /src
      /js/*.js
    /pages
      *.html
    index.html
    package.json
  README.md
  .gitignore

Instalação

Clone o repositório:
git clone https://github.com/seu-usuario/comercios-do-meu-bairro.git
cd comercios-do-meu-bairro


Configure o Firebase:

Crie um projeto no Firebase Console.
Adicione um aplicativo web e copie o firebaseConfig para public/src/js/firebase.js.
Configure o Firestore com as regras fornecidas em docs/firestore.rules.


Instale dependências:
cd public
npm install


Inicie o servidor local:
npx http-server -p 8080

Acesse http://localhost:8080.


Páginas

index.html: Landing page ou redirecionamento.
pages/login.html: Autenticação de usuários.
pages/cadastro-comercio.html: Cadastro de novos comércios.
pages/configuracao-estabelecimento.html: Configuração de serviços, produtos, colaboradores.
pages/atendimento-cliente.html: Gerenciamento de atendimentos e clientes.
pages/dashboard.html: Visão geral com métricas.
pages/agendamentos.html: Gerenciamento de agendamentos.
pages/perfil.html: Edição de dados do usuário/comércio.

Desenvolvimento

Tecnologias: HTML, Bootstrap 5.3.3, JavaScript (ES6), Firebase (Auth, Firestore).
Estilos: Paleta azul/laranja, fonte Poppins (assets/css/styles.css).
Scripts: Módulos JS em src/js/ (ex.: firebase.js, login.js).
Firestore: Estrutura com comercios/{userId}, subcoleções (servicos, produtos, colaboradores, formasPagamento, clientes, atendimentos).

Contribuindo

Fork o repositório.
Crie uma branch: git checkout -b minha-feature.
Commit suas mudanças: git commit -m 'Adiciona minha feature'.
Push para a branch: git push origin minha-feature.
Abra um Pull Request.

Licença
MIT © 2025 Comércios do Meu Bairro
