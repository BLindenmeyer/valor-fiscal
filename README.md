![Node.js](https://img.shields.io/badge/Node.js-20.x-43853D?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)


# 🧩 CRUD de Clientes — Node.js + Express + SQLite + Sequelize + Zod

Sistema completo de gerenciamento de clientes com **backend robusto**, **frontend responsivo** e **infraestrutura dockerizada**, desenvolvido com foco em boas práticas, validação de dados e experiência do usuário. O projeto demonstra um CRUD funcional com diversas **funcionalidades bônus** implementadas para elevar o nível técnico e a qualidade da entrega.

---

## 🚀 Tecnologias Utilizadas

### **Backend**
- Node.js 20 + Express → estrutura MVC clara (Controller → Service → Repository)
- Sequelize (SQLite) → ORM simples e leve para persistência local
- Zod → validação rigorosa de entrada de dados (CPF, CNPJ, e-mail, telefone)
- Jest + Supertest → testes automatizados cobrindo todos os endpoints

### **Frontend**
- HTML5, CSS3 e JavaScript (ES6 Modules)
- Bootstrap 5 + Bootstrap Icons → estilização moderna e responsiva
- Modais dinâmicos, alertas e validações visuais

### **Infraestrutura**
- Docker + Docker Compose → ambiente isolado e fácil de reproduzir
- Banco SQLite persistente via volume

---

## ✨ Funcionalidades Principais

### 🧩 CRUD Completo
Criação, listagem, edição e exclusão de clientes com feedback visual e mensagens dinâmicas. Todas as operações são refletidas em tempo real no frontend, sem necessidade de recarregar a página.

### 🔎 Busca Inteligente de Clientes
Permite pesquisar clientes por **nome**, **CPF** ou **CNPJ**, utilizando `LIKE` e ordenação alfabética. A interface exibe mensagens personalizadas quando não há resultados ou quando o banco está vazio.

### 🔢 Validação de CPF/CNPJ com Dígito Verificador
Implementação de **validação matemática real** de CPF e CNPJ, incluindo cálculo do dígito verificador — garantindo que apenas documentos válidos sejam aceitos, além das validações de formato e tamanho.

### ⚠️ Tratamento de Erros Detalhado
Mensagens claras e específicas para cada situação:
- **409**: conflito (exemplo: CPF ou CNPJ duplicado)
- **404**: registro não encontrado
- **500**: erro interno de servidor
- **ZodError**: falha na validação de entrada (com campo e motivo)

### 💬 Mensagens Dinâmicas no Frontend
Após operações de criação, edição ou exclusão, o sistema exibe alertas automáticos com textos retornados pelo backend (por exemplo: *“Cliente Ana Silva removido com sucesso.”*), evitando mensagens fixas.

### 🧠 Responsividade e UX
A aplicação adapta automaticamente sua exibição:
- **Em telas grandes**: visual em **tabela** (listagem tradicional)
- **Em telas pequenas**: visual em **cards**, otimizando leitura e interação
- Modais ajustáveis e alertas otimizados para toque em dispositivos móveis

---

## 🐳 Execução com Docker

### 1️⃣ Buildar a imagem
```bash
docker compose build
```

### 2️⃣ Subir o container
```bash
docker compose up -d
```

### 3️⃣ Popular o banco (opcional)
```bash
docker compose exec api bash -c "cd backend && npm run seed"
```

> Após isso, acesse [http://localhost:3000](http://localhost:3000)

O backend serve automaticamente o **frontend** (`login.html` e `app.html`).

### 🗄️ Persistência do Banco
O SQLite é salvo em `./backend/database/clientes.sqlite` e montado como volume no container:
```yaml
volumes:
  - ./backend/database:/app/database
```

---

## ⚙️ Execução Local (sem Docker)
```bash
cd backend
npm install
npm run seed   # opcional
npm start
```
Acesse: [http://localhost:3000](http://localhost:3000)

Frontend: abra `frontend/login.html` (login mockado → redireciona para `app.html`).

---

## 📘 Decisões de Arquitetura e Tecnologia

- **Node.js + Express**: escolhidos pela leveza, modularidade e facilidade de criar uma API REST limpa e testável.
- **Sequelize + SQLite**: combinam simplicidade e portabilidade, dispensando servidor de banco externo e facilitando o uso com Docker.
- **Zod**: usado pela clareza e segurança na validação — garante que nenhum dado inválido chegue às camadas de negócio.
- **Frontend estático com Bootstrap**: prioriza agilidade e compatibilidade, mantendo responsividade sem frameworks pesados.
- **Arquitetura em camadas** (Controller → Service → Repository): separação clara de responsabilidades, fácil manutenção e testes.
- **Docker**: garante que qualquer avaliador consiga executar o projeto com os mesmos resultados em qualquer sistema operacional.

---

## 🧪 Testes Automatizados
Executar todos os testes de integração:
```bash
npm test
```
Cobrem CRUD, validações (Zod), mensagens de erro e retornos esperados.

---

## 💾 Seed de Dados
O script `seed.js` gera 10 clientes fictícios com dados variados:
- CPFs e CNPJs válidos (com dígito verificador real)
- Campos opcionais nulos (email, telefone)
- Mistura de pessoas físicas e jurídicas

Execução dentro do container:
```bash
docker compose exec api bash -c "cd backend && npm run seed"
```

---

## 📄 Licença
Uso livre para fins acadêmicos e profissionais. Desenvolvido por Pedro Gouveia.
