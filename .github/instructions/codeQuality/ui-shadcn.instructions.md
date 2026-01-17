---
applyTo: "src/**/*.tsx, src/**/*.astro"
---

# Shadcn UI Components

This project uses @shadcn/ui for user interface components. These are beautifully designed, accessible components that can be customized for your application.

## Finding Installed Components

Components are available in the `src/ui/base` folder, according to the aliases in the `components.json` file.

## Using Components

Import components according to the configured `@/` alias:

```tsx
import { Button } from "@/ui/base/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/base/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/base/card"
```

Example usage of components:

```tsx
<Button variant="outline">Click me</Button>

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

## Installing Additional Components

Many other components are available but not currently installed. The full list can be found at https://ui.shadcn.com/r

To install a new component, use the shadcn CLI:

```bash
npx shadcn@latest add [component-name]
```

For example, to add the accordion component:

```bash
npx shadcn@latest add accordion
```

Important: `npx shadcn-ui@latest` has been deprecated, use `npx shadcn@latest`

Some popular components include:

- Accordion
- Alert
- AlertDialog
- AspectRatio
- Avatar
- Calendar
- Checkbox
- Collapsible
- Command
- ContextMenu
- DataTable
- DatePicker
- Dropdown Menu
- Form
- Hover Card
- Menubar
- Navigation Menu
- Popover
- Progress
- Radio Group
- ScrollArea
- Select
- Separator
- Sheet
- Skeleton
- Slider
- Switch
- Table
- Textarea
- Sonner (previously Toast)
- Toggle
- Tooltip

## Component Styling

This project uses the "default" style variant with "slate" base color and CSS variables for theming, according to the configuration in `components.json`.
