"use client"

import { useState } from "react";
import { Form, Dropdown, Image } from "react-bootstrap";
import styled from "styled-components";
import { FaPaperclip, FaPaperPlane, FaChevronDown } from "react-icons/fa";

export interface ModelConfig {
  name: string;
  id: string;
  type: 'text' | 'image';
}

export interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => Promise<void>;
  selectedModel: ModelConfig;
  setSelectedModel: (model: ModelConfig) => void;
  models: ModelConfig[];
  isLoading: boolean;
}

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background: #111;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
`;

const StyledForm = styled(Form)`
  margin: 0;
`;

const StyledFormControl = styled(Form.Control)`
  background-color: transparent;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 0.5rem;
  resize: none;
  width: 100%;
  box-shadow: none !important;
  &:focus {
    background: transparent;
    color: #fff;
    border: none;
    box-shadow: none;
  }
`;

const IconButton = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  color: #fff;
  padding: 0.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  &:hover:not(:disabled) {
    background: #222;
  }
`;

const StyledDropdown = styled(Dropdown)`
  .dropdown-toggle {
    background: none !important;
    border: none !important;
    color: #fff !important;
    padding: 0.25rem 0.5rem !important;
    border-radius: 0.5rem !important;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: none !important;
  }
  .dropdown-menu {
    background: #222;
    border: none;
    border-radius: 0.5rem;
    min-width: 150px;
  }
  .dropdown-item {
    color: #fff;
    &:active, &.active {
      background: #007bff;
      color: #fff;
    }
  }
`;

const StyledImage = styled(Image)`
  max-width: 40px;
  max-height: 40px;
  border-radius: 0.5rem;
  margin-left: 0.25rem;
`;

export default function ChatInput({
  onSendMessage,
  selectedModel,
  setSelectedModel,
  models,
  isLoading
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;
    onSendMessage(message, selectedImage);
    setMessage("");
    setSelectedImage(undefined);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <InputContainer style={{ flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "0.5rem" }}>
        <StyledFormControl
        as="textarea"
        placeholder="Type your message..."
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
        style={{ flex: 1 }}
        />
        {imagePreview && (
        <StyledImage
          src={imagePreview}
          alt="Preview"
        />
        )}
        <IconButton
        type="submit"
        title="Send"
        disabled={isLoading || (!message.trim() && !selectedImage)}
        >
        <FaPaperPlane size={18} />
        </IconButton>
      </div>
      <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "0.5rem", marginTop: "0.25rem" }}>
        <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id="image-upload"
        />
        <IconButton as="label" htmlFor="image-upload" title="Attach image" disabled={isLoading}>
        <FaPaperclip size={18} />
        </IconButton>
        <StyledDropdown>
        <Dropdown.Toggle id="dropdown-basic">
          {selectedModel.name} <FaChevronDown size={12} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {models.map((model) => (
          <Dropdown.Item
            key={model.id}
            onClick={() => setSelectedModel(model)}
            active={selectedModel.id === model.id}
          >
            {model.name}
          </Dropdown.Item>
          ))}
        </Dropdown.Menu>
        </StyledDropdown>
      </div>
      </InputContainer>
    </StyledForm>
  );
}
