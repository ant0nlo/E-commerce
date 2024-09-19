import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock the child components
jest.mock('../components/navbar/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../pages/Shop', () => () => <div data-testid="shop">Shop</div>);
jest.mock('../pages/ShopCategory', () => ({ banner, category }) => (
  <div data-testid={`shop-category-${category}`}>ShopCategory {category}</div>
));
jest.mock('../pages/Product', () => () => <div data-testid="product">Product</div>);
jest.mock('../pages/Cart', () => () => <div data-testid="cart">Cart</div>);
jest.mock('../pages/LoginSignup', () => () => <div data-testid="login-signup">LoginSignup</div>);
jest.mock('../components/footer/Footer', () => () => <div data-testid="footer">Footer</div>);

describe('App Component', () => {
  test('renders Navbar and Footer on all routes', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('renders Shop component on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('shop')).toBeInTheDocument();
  });

  test('renders ShopCategory component for mens path', () => {
    render(
      <MemoryRouter initialEntries={['/mens']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('shop-category-men')).toBeInTheDocument();
  });

  test('renders ShopCategory component for womens path', () => {
    render(
      <MemoryRouter initialEntries={['/womens']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('shop-category-women')).toBeInTheDocument();
  });

  test('renders ShopCategory component for kids path', () => {
    render(
      <MemoryRouter initialEntries={['/kids']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('shop-category-kid')).toBeInTheDocument();
  });

  test('renders Product component for product path', () => {
    render(
      <MemoryRouter initialEntries={['/product/1']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('product')).toBeInTheDocument();
  });

  test('renders Cart component for cart path', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('cart')).toBeInTheDocument();
  });

  test('renders LoginSignup component for login path', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-signup')).toBeInTheDocument();
  });
});