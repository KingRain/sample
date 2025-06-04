import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from '@jest/globals';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  test('renders correctly', () => {
    render(<Navbar />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('contains correct branding', () => {
    render(<Navbar />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('SampleChat');
  });

  test('handles logout click', () => {
    const mockRouter = {
      push: jest.fn()
    };

    jest.mock('next/navigation', () => ({
      useRouter: () => mockRouter
    }));

    render(<Navbar />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});
