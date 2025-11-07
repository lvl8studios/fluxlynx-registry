# FluxLynx Registry

This is the component registry for FluxLynx. Components defined here can be installed using the `@fluxlynx/cli` tool.

## Registry Structure

The `registry.json` file defines all available components:

```json
{
  "name": "fluxlynx-registry",
  "version": "0.1.0",
  "components": {
    "component-name": {
      "title": "Human-readable title",
      "files": ["components/component-name.tsx"],
      "peerDeps": ["react", "react-dom", "@fluxlynx/react"],
      "deps": ["button", "input"]
    }
  },
  "shared": {
    "files": ["lib/utils.ts"]
  }
}
```

## Component Fields

- **title**: Human-readable name for the component
- **files**: Array of file paths relative to the registry root
  - Can be strings: `"components/stars.tsx"`
  - Or objects with custom destinations: `{ "path": "components/stars.tsx", "to": "custom/path.tsx" }`
- **peerDeps**: NPM packages that should be installed separately (not auto-installed by CLI)
- **deps**: Shadcn UI components to auto-install before copying component files
- **requires**: Additional requirements (e.g., `{ "tailwind": true }`)

## Shadcn Dependencies

When a component specifies `deps`, the FluxLynx CLI will automatically run `npx shadcn@latest add <component>` for each dependency before copying the component files.

Example:
```json
{
  "contact": {
    "title": "Contact form",
    "files": ["components/contact-form.tsx"],
    "peerDeps": ["react", "react-dom", "@fluxlynx/react"],
    "deps": ["button", "input"]
  }
}
```

When a user runs `npx @fluxlynx/cli add contact`, the CLI will:
1. Install `button` and `input` components via shadcn
2. Copy shared files (if any)
3. Copy `components/contact-form.tsx` to the user's project

## Adding Components

1. Create your component file in the `components/` directory
2. Add shared utilities to `lib/` if needed
3. Update `registry.json` with the component definition
4. Commit and push to the main branch
5. Users can now install with `npx @fluxlynx/cli add your-component`

## File Mapping

By default:
- `components/*` → User's `src/components/ui/*`
- `lib/*` → User's `src/lib/*`

Users can customize these paths using a `components.json` or `fluxlynx.json` config file.
