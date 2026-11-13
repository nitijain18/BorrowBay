<div align="center">

# 🌊 BorrowBay

**A peer-to-peer item rental and exchange platform with location-based discovery**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

</div>

---

## 📖 About

BorrowBay lets people lend and borrow things they own instead of buying them new. Users can list items, browse what's available around them, and arrange rentals or exchanges with other users. Items are discovered by location, so borrowers see what's nearby first.

## ✨ Features

- List items for rent or exchange
- Location-based item discovery
- Browse and search available items
- RESTful backend APIs built with Spring Boot
- Persistent storage with PostgreSQL

> Add or remove lines here so the list matches exactly what your app does (for example login, booking requests, reviews, image upload).

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Java, Spring Boot, REST APIs |
| Database | PostgreSQL |
| Tools | Git, GitHub, Postman, Maven |

## 📸 Screenshots

<!-- Add screenshots to a /screenshots folder, then uncomment and edit: -->
<!-- ![Home](screenshots/home.png) -->
<!-- ![Item details](screenshots/item.png) -->

## 📂 Project structure

```
BorrowBay/
├── backend/     # Spring Boot REST API
└── frontend/    # React app
```

> Rename the folders above if yours are named differently.

## 🚀 Getting started

### Prerequisites
- Java 17+
- Maven
- Node.js 18+
- PostgreSQL

### 1. Clone the repo
```bash
git clone https://github.com/nitijain18/BorrowBay.git
cd BorrowBay
```

### 2. Set up the database
Create a PostgreSQL database:
```sql
CREATE DATABASE borrowbay;
```

### 3. Run the backend
Update `backend/src/main/resources/application.properties` with your own database details:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/borrowbay
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```
Then start it:
```bash
cd backend
mvn spring-boot:run
```

### 4. Run the frontend
```bash
cd frontend
npm install
npm start
```
The app opens at `http://localhost:3000`, and the API runs at `http://localhost:8080`.

## 🔌 API overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | Get all available items |
| GET | `/api/items/{id}` | Get one item |
| POST | `/api/items` | List a new item |
| PUT | `/api/items/{id}` | Update an item |
| DELETE | `/api/items/{id}` | Remove an item |

> Replace these with your real endpoints.

## 🔮 Future improvements

- Ratings and reviews for lenders and borrowers
- In-app chat between users
- Docker setup and deployment on AWS

## 👩‍💻 Author

**Niti Jain**
[LinkedIn](https://linkedin.com/in/nitijain18) · [GitHub](https://github.com/nitijain18) · jainniti1807@gmail.com
