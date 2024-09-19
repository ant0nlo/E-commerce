# E-commerce Project

![E-commerce Banner](https://your-image-link.com/banner.png)

## Description

Welcome to our **E-commerce** project, built with **React**! This website offers comprehensive online shopping functionality, including product browsing, cart management, user profile management, and more. Our goal is to create an intuitive and enjoyable user experience while providing a flexible and scalable architecture for developers.

## Features

- **Product Browsing:** Explore various product categories with detailed descriptions and images.
- **Search and Filtering:** Easily find products using keyword search and filters by category, price, and more.
- **Add to Cart:** Add products to your cart and manage quantities.
- **User Profile Management:** Register and log in with user profiles, and manage your orders.
- **Reviews and Ratings:** Leave reviews and ratings for products.
- **Payment and Orders:** Secure payment processing and order tracking.

## Technologies Used

- **Frontend:**
  - [React](https://reactjs.org/) - Library for building user interfaces.
  - [React Router](https://reactrouter.com/) - For managing application navigation.
  - [Redux](https://redux.js.org/) - For managing global state.
  - [Sass](https://sass-lang.com/) - For styling components.
  
- **Backend:**
  - [Node.js](https://nodejs.org/) - JavaScript runtime for server-side development.
  - [Express.js](https://expressjs.com/) - Web framework for Node.js.
  - [MongoDB](https://www.mongodb.com/) - NoSQL database.
  
- **Other:**
  - [Axios](https://axios-http.com/) - For making HTTP requests.
  - [JWT](https://jwt.io/) - For authentication and authorization.
  - [Stripe](https://stripe.com/) - For payment processing.

## Installation

Follow these steps to set up and run the project locally on your computer.

### Prerequisites

- **Node.js and npm:** Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed. You can download them from the official website.

### Navigating And Installing Dependencies

1. git clone https://github.com/ant0nlo/E-commerce.git
2. cd E-commerce
3. cd frontend
4. npm install
5. cd ../backend
6. npm install

### Setting Up Environment Variables
- Create a .env file for both frontend and backend, and add the necessary variables.
 1. Backend .env:
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
 2. Frontend .env:
    REACT_APP_API_URL=http://localhost:5000/api
    REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key

### Running the Application
1. cd backend
2. npm start
3. cd frontend
4. npm start

### Running the Admin Panel
-**The Admin Panel provides a user-friendly interface for administrators to manage products in the database. It allows adding new products, editing existing ones, and deleting products seamlessly without direct database interaction.**
- cd admin
- npm start

-**Admin Features**
-Add New Products
-Edit Existing Products:
-Delete Products
-Manage Categories

## Usage
- Open your web browser and navigate to `http://localhost:3000` to view the application.
- The Admin Panel will be accessible at `http://localhost:3001` (If port 3001 is in use, you might need to specify a different port.)

## Features
- User Authentication
- Product Listing
- Product Search
- Shopping Cart
- Checkout Process
- Responsive Design

## Contributing
Contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
