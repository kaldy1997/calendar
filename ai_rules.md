# AI Rules — Calendario Móvil

## Descripción del Proyecto

Aplicación de calendario para dispositivos móviles construida como Web App con React.
Diseñada como PWA con enfoque mobile-first y estética premium oscura.

---

## Stack Tecnológico

| Tecnología     | Versión     | Uso                          |
| -------------- | ----------- | ---------------------------- |
| React          | 19.x        | Librería de UI               |
| TypeScript     | 6.x         | Tipado estático              |
| Vite           | 8.x         | Bundler / Dev server         |
| SASS (SCSS)    | latest      | Estilos / Maquetación        |
| Vitest         | latest      | Testing unitario             |
| Testing Library| latest      | Renderizado de tests React   |

---

## Arquitectura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   └── ComponentName/
│       ├── ComponentName.tsx
│       ├── ComponentName.scss
│       ├── ComponentName.test.tsx
│       └── index.ts     # Barrel export
├── hooks/               # Custom hooks
├── services/            # Lógica de negocio / APIs
├── types/               # Tipos e interfaces compartidas
├── utils/               # Funciones utilitarias puras
├── test/                # Configuración de tests
│   └── setup.ts
├── App.tsx
├── App.scss
├── App.test.tsx
├── index.scss           # Variables globales, reset, tokens
└── main.tsx             # Entry point
```

---

## Reglas de Desarrollo

### General

1. **Idioma**: Los comentarios en el código y los nombres de variables deben ser en **inglés**. Los textos visibles al usuario (UI) deben ser en **español**.
2. **Funciones**: Usar **function declarations** para componentes React. Usar **arrow functions** para helpers y callbacks.
3. **Exports**: Usar **named exports** como norma general. Cada carpeta de componente debe tener un `index.ts` con barrel exports.
4. **Archivos**: Un componente por archivo. El archivo debe llevar el mismo nombre que el componente.
5. **Punto y coma**: Todas las líneas de código deben terminar con punto y coma (`;`).

### TypeScript

1. **Strict mode**: Siempre activo. No usar `any` bajo ninguna circunstancia.
2. **Interfaces vs Types**: Usar `interface` para objetos y props de componentes. Usar `type` para uniones, intersecciones y tipos utilitarios.
3. **Enums**: Evitar `enum`. Usar `as const` con objetos literales.
4. **Null checks**: Preferir optional chaining (`?.`) y nullish coalescing (`??`).

### Estilos (SCSS)

1. **Metodología**: Usar **BEM** (`block__element--modifier`).
2. **Variables**: Todas las variables de diseño (colores, tipografía, spacing, etc.) deben estar definidas en `index.scss` y referenciadas con `@use`.
3. **No estilos inline**: Nunca usar `style={{}}` en JSX. Todo va en archivos `.scss`.
4. **Mobile-first**: Diseñar primero para móvil (max-width: 430px), luego escalar con media queries si fuera necesario.
5. **Animaciones**: Usar `transition` para micro-interacciones y `@keyframes` para animaciones complejas. Siempre respetar `prefers-reduced-motion`.

### Componentes React

1. **Functional components only**: No usar class components.
2. **Hooks**: Extraer lógica compleja a custom hooks en la carpeta `hooks/`.
3. **Props**: Definir una `interface` para las props de cada componente.
4. **State management**: Usar `useState` y `useReducer` para estado local. Evaluar `useContext` para estado compartido simple.
5. **Memoización**: Usar `useMemo` y `useCallback` solo cuando haya un beneficio medible de rendimiento, no por defecto.
6. **Accesibilidad**: Todos los elementos interactivos deben tener `aria-label` o `aria-labelledby`. Usar semántica HTML correcta.
7. **data-testid**: Todos los elementos interactivos y contenedores clave deben tener un `data-testid` único para testing.

### Testing

1. **Framework**: Vitest + React Testing Library.
2. **Ubicación**: Los tests se colocan junto al componente que prueban (`ComponentName.test.tsx`).
3. **Cobertura mínima**: Aspirar al 80% de cobertura en componentes.
4. **Qué testear**:
   - Renderizado correcto del componente.
   - Interacciones del usuario (clicks, inputs).
   - Cambios de estado y su reflejo en el DOM.
   - Llamadas a callbacks / props functions.
5. **Qué NO testear**:
   - Implementación interna (no testear state directamente).
   - Estilos CSS.
   - Librerías de terceros.
6. **Naming**: `describe('ComponentName', () => { it('should...') })`.

### Verificación y Agentes AI

1. **Ejecución de Javascript**: En las verificaciones realizadas en el navegador, los agentes AI tienen permiso explícito para ejecutar Javascript de forma autónoma con el fin de verificar el código, sin necesidad de solicitar autorización previa para cada ejecución.
2. **Comandos de Test**: Los comandos de test (e.g. `npm run test`, `npm run test:coverage`) se deben ejecutar sin solicitar confirmación ni aceptación del comando al usuario. Se deben realizar de forma autónoma. Deben quedar en cada archivo por encima de una cobertura del 80%.

### Git / Commits

1. **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `style:`, `chore:`.
2. **Idioma de commits**: Inglés.
3. **Una feature por commit**. No mezclar múltiples cambios no relacionados.

---

## Tokens de Diseño

Referencia rápida a las variables principales definidas en `src/index.scss`:

- **Colores fondo**: `$color-bg-primary`, `$color-bg-secondary`, `$color-bg-card`
- **Colores texto**: `$color-text-primary`, `$color-text-secondary`, `$color-text-muted`
- **Acento**: `$color-accent`, `$color-accent-light`
- **Hoy**: `$color-today`, `$color-today-glow`
- **Spacing**: `$spacing-xs` (4px) → `$spacing-2xl` (32px)
- **Radius**: `$radius-sm` (8px) → `$radius-full` (50%)
- **Transiciones**: `$transition-fast` (150ms), `$transition-base` (250ms), `$transition-slow` (400ms)

---

## Comandos Disponibles

| Comando             | Descripción                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Servidor de desarrollo (Vite)     |
| `npm run build`     | Build de producción               |
| `npm run test`      | Ejecutar tests una vez            |
| `npm run test:watch`| Tests en modo watch               |
| `npm run test:coverage` | Tests con reporte de cobertura|
| `npm run lint`      | Linter (ESLint)                   |
