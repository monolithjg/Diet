import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgeInput } from '../AgeInput';

describe('AgeInput', () => {
  it('should render with initial value', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={25} onChange={mockOnChange} useDebouncing={false} />);
    
    const input = screen.getByRole('spinbutton', { name: /age/i });
    expect(input).toHaveValue(25); // Number input expects number value
  });

  it('should show required indicator when required', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={0} onChange={mockOnChange} required useDebouncing={false} />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should validate age range', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={0} onChange={mockOnChange} useDebouncing={false} />);
    
    const input = screen.getByRole('spinbutton', { name: /age/i });
    
    // Test invalid age (too low)
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.blur(input);
    
    expect(screen.getByText(/age must be between 13 and 120 years/i)).toBeInTheDocument();
  });

  it('should call onChange with valid age', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={0} onChange={mockOnChange} useDebouncing={false} />);
    
    const input = screen.getByRole('spinbutton', { name: /age/i });
    
    fireEvent.change(input, { target: { value: '25' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(25);
  });

  it('should not call onChange with invalid age', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={0} onChange={mockOnChange} useDebouncing={false} />);
    
    const input = screen.getByRole('spinbutton', { name: /age/i });
    
    fireEvent.change(input, { target: { value: '150' } }); // Too high
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should show error message for empty required field', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={0} onChange={mockOnChange} required useDebouncing={false} />);
    
    const input = screen.getByRole('spinbutton', { name: /age/i });
    
    // Clear the field and blur to trigger validation
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    
    expect(screen.getByText(/age is required/i)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={25} onChange={mockOnChange} disabled useDebouncing={false} />);
    
    const input = screen.getByRole('spinbutton', { name: /age/i });
    expect(input).toBeDisabled();
  });

  it('should have proper accessibility attributes', () => {
    const mockOnChange = vi.fn();
    render(<AgeInput value={0} onChange={mockOnChange} useDebouncing={false} />);
    
    const input = screen.getByRole('spinbutton', { name: /age/i });
    
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('inputMode', 'numeric');
    expect(input).toHaveAttribute('min', '13');
    expect(input).toHaveAttribute('max', '120');
  });
}); 