{
  "theme": "dark",
  "archetype": "Swiss & High-Contrast (Dark Mode Adapted)",
  "colors": {
    "background": "0 0% 4%", 
    "foreground": "0 0% 98%", 
    "card": "0 0% 7%", 
    "card_foreground": "0 0% 98%",
    "popover": "0 0% 7%",
    "popover_foreground": "0 0% 98%",
    "primary": "221 83% 53%", 
    "primary_foreground": "0 0% 98%",
    "secondary": "0 0% 12%",
    "secondary_foreground": "0 0% 98%",
    "muted": "0 0% 15%",
    "muted_foreground": "0 0% 65%",
    "accent": "221 83% 53%",
    "accent_foreground": "0 0% 98%",
    "destructive": "0 84% 60%", 
    "destructive_foreground": "0 0% 98%",
    "border": "0 0% 15%",
    "input": "0 0% 15%",
    "ring": "221 83% 53%"
  },
  "typography": {
    "heading_font": "Outfit",
    "body_font": "IBM Plex Sans",
    "h1": "text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight",
    "h2": "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
    "h3": "text-xl sm:text-2xl font-semibold tracking-tight",
    "body": "text-base leading-relaxed",
    "small": "text-sm tracking-wide",
    "overline": "uppercase text-xs tracking-[0.2em] font-medium"
  },
  "layout_spacing": {
    "dashboard_grid": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    "bento_padding": "p-6 sm:p-8",
    "container_radius": "rounded-lg",
    "border_width": "border",
    "alignment": "Left-align content, geometric grid borders, optical alignment for icons."
  },
  "components": {
    "button": "Flat background, 1px border. On hover: slight lift (-translate-y-0.5), subtle glow shadow, lighter primary color.",
    "card": "Flat background (bg-card), 1px subtle border (border-border), no shadow by default. Hover: border color brightens (border-muted-foreground/30), subtle ambient shadow.",
    "input": "Shadcn input customized with sharp edges or max 8px radius, dark background (bg-background), focus state with glowing ring (ring-2 ring-primary/50).",
    "status_badge": "Subtle transparent backgrounds with distinct border colors (e.g., Interview: bg-blue-500/10 border-blue-500/20 text-blue-400)."
  },
  "motion": {
    "hover": "transition-all duration-200 ease-in-out",
    "entrance": "Staggered fade-up for job cards using framer-motion.",
    "modal": "Scale in and fade out with backdrop-blur-md on overlay."
  },
  "icons": {
    "library": "@phosphor-icons/react",
    "style": "Duotone or bold weights, matching text size."
  },
  "media": {
    "images": [
      {
        "url": "https://static.prod-images.emergentagent.com/jobs/9b52b448-064b-4433-9575-b8ab07ff69a1/images/27ea2d661576c9e731d38af98455a8bed3f46193392fc980fe2b963ccf2675f7.png",
        "category": "empty_state",
        "description": "3D minimalist illustration of an empty folder floating in dark space. Use this when the user has 0 job applications."
      },
      {
        "url": "https://static.prod-images.emergentagent.com/jobs/9b52b448-064b-4433-9575-b8ab07ff69a1/images/b133fa386bb9b02aaf851539c516d23ea9adde1098a636e8f45a3c9c739064b5.png",
        "category": "background",
        "description": "Subtle dark textured background. Use this behind the main dashboard or login/register pages with a low opacity (e.g., opacity-10 or 20) as a fixed background covering the viewport."
      }
    ]
  },
  "accessibility": {
    "focus": "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "contrast": "Ensure all text meets minimum 4.5:1 ratio against dark backgrounds. No gray-on-gray for essential data.",
    "testing_attributes": "All interactive elements (buttons, inputs, dropdowns, links, status badges) MUST have data-testid."
  },
  "instructions_to_main_agent": [
    "Install `@phosphor-icons/react`, `framer-motion`, `@fontsource/outfit`, and `@fontsource/ibm-plex-sans`.",
    "Update Tailwind config and `index.css` to use the defined dark mode HSL colors. Force dark mode in the app by adding the `dark` class to the root or removing the media query condition.",
    "Implement the Dashboard using a dense 'Control Room' grid layout for the job cards (gap-6).",
    "Ensure the 'Add Job' form uses Shadcn components but heavily customized to fit the Swiss High-Contrast dark theme (stark 1px borders, flat colors, no default soft shadows).",
    "Implement Status Badges on the cards with distinct semantic colors (Applied: Gray/White, Interview: Blue, Offer: Green, Rejected: Red) utilizing tinted backgrounds and subtle borders.",
    "For the job cards, ensure you have a dropdown menu to quickly change the status without opening an edit modal.",
    "The empty state must display the provided empty_state image in a generous layout.",
    "Use framer-motion for staggering the job cards when they enter the dashboard viewport.",
    "Add `data-testid` to ALL interactive elements for automated testing."
  ]
}