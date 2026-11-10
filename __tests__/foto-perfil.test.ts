import { describe, expect, it, jest } from '@jest/globals';
jest.mock('expo-image-picker', () => ({}));
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: {}, SaveFormat: { JPEG: 'jpeg' } }));
import { fotoParaMostrar, inicial } from '../src/lib/foto';

describe('foto de perfil', () => {
  it('muestra primero la que ella eligió, después la de su cuenta', () => {
    expect(fotoParaMostrar('data:image/jpeg;base64,AAA', 'https://lh3.googleusercontent.com/x')).toBe('data:image/jpeg;base64,AAA');
    expect(fotoParaMostrar(null, 'https://lh3.googleusercontent.com/x')).toBe('https://lh3.googleusercontent.com/x');
    expect(fotoParaMostrar(null, null)).toBeNull();
  });

  it('no usa direcciones raras ni sin cifrar', () => {
    expect(fotoParaMostrar('javascript:alert(1)', 'http://inseguro.com/a.png')).toBeNull();
  });

  it('sin foto, la inicial del nombre o del mail', () => {
    expect(inicial('ana')).toBe('A');
    expect(inicial('', 'lucia@ejemplo.com')).toBe('L');
    expect(inicial('', '')).toBe('🌸');
  });
});
