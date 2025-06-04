import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from '@jest/globals';
import ChatInput, { ModelConfig } from './ChatInput';

const mockModel: ModelConfig = {
  name: 'Test Model',
  id: 'test',
  type: 'text'
};

const mockModels: ModelConfig[] = [
  mockModel,
  {
    name: 'Test Model 2',
    id: 'test2',
    type: 'text'
  }
];

describe('ChatInput Component', () => {
  const mockOnSendMessage = jest.fn();
  const mockSetSelectedModel = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
    mockSetSelectedModel.mockClear();
  });

  test('renders correctly', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        selectedModel={mockModel}
        setSelectedModel={mockSetSelectedModel}
        models={mockModels}
        isLoading={false}
      />
    );
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /attach image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dropdown/i })).toBeInTheDocument();
  });

  test('handles message input', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        selectedModel={mockModel}
        setSelectedModel={mockSetSelectedModel}
        models={mockModels}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Hello world' } });
    expect(input).toHaveValue('Hello world');
  });

  test('calls onSendMessage with message when send button is clicked', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        selectedModel={mockModel}
        setSelectedModel={mockSetSelectedModel}
        models={mockModels}
        isLoading={false}
      />
    );

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello world' } });

    const button = screen.getByRole('button', { name: /send/i });
    fireEvent.click(button);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', undefined);
  });

  test('handles model selection', () => {
    render(
      <ChatInput
        onSendMessage={mockOnSendMessage}
        selectedModel={mockModel}
        setSelectedModel={mockSetSelectedModel}
        models={mockModels}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /dropdown/i }));
    fireEvent.click(screen.getByText('Test Model 2'));
    
    expect(mockSetSelectedModel).toHaveBeenCalledWith(mockModels[1]);
  });
});
