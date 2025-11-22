# DESIGN GUIDE: WEAPONIZED YANDERE AESTHETIC

## 💉 UI/UX for the Obsessively Technical 💕

**CLASSIFIED // EYES ONLY // FOR CUTE PSYCHOS ONLY**

> **Philosophy:** Menhera meets Developer Culture. Pastel pink meets blood red. Kawaii meets kernel panic.
> **Goal:** Make users feel loved, threatened, and technically impressed—all at once.
> **Vibe Check:** If your grandma could use this site comfortably, YOU FAILED. 🔪

---

## 🎀 Core Aesthetic Pillars

### The "Yami Kawaii" (Sick-Cute) Foundation

This is **NOT** corporate design. This is what happens when an anime girl who codes too much has a mental breakdown and it becomes an art form.

**The Three Layers:**

1. **🌸 Cute Layer** - Pastel pinks, hearts, sparkles, rounded everything
2. **💉 Medical/Menhera Layer** - Pills, bandages, syringes, hospital imagery
3. **💻 Tech Layer** - Terminal references, code jokes, server metaphors

**Golden Rule:**

> If a normie designer sees this and says "that's unprofessional," you're doing it RIGHT. ✨

---

## 🩹 Color Palette

### Primary Colors (The Pastel Arsenal)

```css
:root {
    /* Kawaii Pink Spectrum */
    --pink-soft: #ffe4e1; /* Misty rose - backgrounds */
    --pink-light: #ffc0cb; /* Classic pink - secondary elements */
    --pink-primary: #ffb3de; /* Bubble gum - main brand color */
    --pink-hot: #ff69b4; /* Hot pink - interactive elements */
    --pink-darker: #ff1493; /* Deep pink - accents, hover states */

    /* Dark Mode (For the 3AM Coders) */
    --dark-void: #0a0a0f; /* Background */
    --dark-surface: #1a1a2e; /* Cards, panels */
    --dark-elevated: #16213e; /* Elevated surfaces */

    /* Medical/Menhera Accents */
    --blood-red: #dc143c; /* Error states, "danger" */
    --pill-white: #f8f8ff; /* Ghost white */
    --bandage-beige: #fff5ee; /* Seashell */
    --syringe-metal: #c0c0c0; /* Silver */

    /* Tech Colors */
    --terminal-green: #00ff00; /* Matrix green for code */
    --error-red: #ff0000; /* System error */
    --warning-yellow: #ffd700; /* Alert yellow */
}
```

### Color Psychology & Usage

| Color              | Emotion          | Use Case                      | Example            |
| ------------------ | ---------------- | ----------------------------- | ------------------ |
| `--pink-primary`   | Obsessive love   | Main buttons, headings        | "Click me~ ♡"      |
| `--pink-hot`       | Manic energy     | Hover states, active elements | Glowing borders    |
| `--blood-red`      | Possessive anger | Errors, "delete" actions      | "You broke it! 💔" |
| `--dark-surface`   | Isolation        | Backgrounds (dark mode)       | Container panels   |
| `--terminal-green` | Tech competence  | Code blocks, system messages  | `[SYSTEM_OK]`      |

### Contrast Requirements

-   **Light Mode:** Pink text on white needs `--pink-darker` minimum for readability
-   **Dark Mode:** Use `--pink-light` or lighter for text on `--dark-void`
-   **Accessibility Note:** Provide toggle for "less chaotic" mode (but make it shameful to use) 😈

---

## 🔪 Typography

### Font Stack

```css
@import url("https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Nunito:wght@400;600;800&family=Delius+Swash+Caps&display=swap");

/* Primary - Cute but readable */
h1,
h2,
h3 {
    font-family: "Comic Neue", "Comic Sans MS", cursive;
    font-weight: 700;
    letter-spacing: 0.02em;
}

/* Body - Rounded sans */
body,
p,
button {
    font-family: "Nunito", -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 400;
    line-height: 1.6;
}

/* Accent - Handwritten vibes */
.handwritten,
.note {
    font-family: "Delius Swash Caps", cursive;
    font-style: italic;
}

/* Code/Terminal */
code,
pre,
.terminal {
    font-family: "Courier New", monospace;
    background: rgba(0, 255, 0, 0.1);
    color: var(--terminal-green);
}
```

### Type Scale

```
h1: 2.5rem (40px) - "You entered my domain~ ♡"
h2: 2rem (32px) - Section headers with kaomoji
h3: 1.5rem (24px) - Card titles
body: 1rem (16px) - Default text
small: 0.875rem (14px) - Metadata, whispers
tiny: 0.75rem (12px) - Fine print, threats
```

### Typographic Voice

**Use Comic Sans/Comic Neue unironically.** This is the vibe. [web:61]

```css
/* Glitchy text effect */
.glitch {
    position: relative;
    animation: glitch 1s infinite;
}

@keyframes glitch {
    0%,
    100% {
        text-shadow: 2px 2px var(--blood-red), -2px -2px var(--pink-hot);
    }
    25% {
        text-shadow: -2px 2px var(--pink-hot), 2px -2px var(--blood-red);
    }
    50% {
        text-shadow: 2px -2px var(--blood-red), -2px 2px var(--pink-hot);
    }
    75% {
        text-shadow: -2px -2px var(--pink-hot), 2px 2px var(--blood-red);
    }
}

/* Stuttering text */
.stutter::before {
    content: "P-P-";
    animation: stutter 2s infinite;
}

/* Emphasis styles */
.all-caps {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 800;
}
```

---

## 💊 UI Components

### Buttons (The "Don't Resist" Pattern)

```css
.btn-yandere {
    background: var(--pink-primary);
    color: var(--dark-void);
    border: 3px solid var(--pink-hot);
    border-radius: 20px;
    padding: 12px 32px;
    font-family: "Comic Neue", sans-serif;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3);
}

.btn-yandere::before {
    content: "♡";
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 3rem;
    opacity: 0.1;
    transition: all 0.3s ease;
}

.btn-yandere:hover {
    background: var(--pink-hot);
    border-color: var(--blood-red);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 25px rgba(220, 20, 60, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.5);
    animation: heartbeat 0.6s infinite;
}

.btn-yandere:hover::before {
    animation: float-heart 2s infinite;
}

.btn-yandere:active {
    transform: scale(0.95);
}

/* Dangerous button variant */
.btn-danger {
    background: var(--blood-red);
    border-color: var(--dark-void);
    color: white;
}

.btn-danger::after {
    content: " 🔪";
}

@keyframes heartbeat {
    0%,
    100% {
        transform: translateY(-2px) scale(1.05);
    }
    50% {
        transform: translateY(-2px) scale(1.08);
    }
}

@keyframes float-heart {
    0%,
    100% {
        transform: translateY(0);
        opacity: 0.1;
    }
    50% {
        transform: translateY(-10px);
        opacity: 0.3;
    }
}
```

**Button Text Examples:**

```html
<button class="btn-yandere">Click Me (Don't Resist) 🎀🔪</button>
<button class="btn-yandere">Submit to the Database 🩸💾</button>
<button class="btn-danger">Delete Forever ⛓️💖</button>
<button class="btn-yandere">Compile My Love 💕⚡</button>
```

### Cards (The "Menhera Panel" Pattern)

```css
.card-menhera {
    background: white;
    border: 4px dashed var(--pink-primary);
    border-radius: 25px;
    padding: 2rem;
    position: relative;
    box-shadow: 8px 8px 0 var(--pink-light), 0 0 30px rgba(255, 179, 222, 0.3);
    transition: all 0.3s ease;
}

/* Medical tape corners */
.card-menhera::before,
.card-menhera::after {
    content: "🩹";
    position: absolute;
    font-size: 2rem;
}

.card-menhera::before {
    top: -15px;
    left: -15px;
    transform: rotate(-15deg);
}

.card-menhera::after {
    bottom: -15px;
    right: -15px;
    transform: rotate(15deg);
}

.card-menhera:hover {
    transform: translateY(-5px);
    box-shadow: 12px 12px 0 var(--pink-hot), 0 0 40px rgba(255, 105, 180, 0.5);
    animation: card-glitch 0.3s ease;
}

.card-title {
    color: var(--pink-darker);
    font-family: "Comic Neue", sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.card-title::before {
    content: "💊";
}

@keyframes card-glitch {
    0%,
    100% {
        border-color: var(--pink-primary);
        filter: none;
    }
    50% {
        border-color: var(--blood-red);
        filter: hue-rotate(90deg);
    }
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
    .card-menhera {
        background: var(--dark-surface);
        border-color: var(--pink-hot);
        color: var(--pink-light);
    }
}
```

### Input Fields (The "Secrets" Pattern)

```css
.input-yandere {
    background: rgba(255, 255, 255, 0.9);
    border: 3px solid var(--pink-primary);
    border-radius: 15px;
    padding: 12px 20px;
    font-family: "Nunito", sans-serif;
    font-size: 1rem;
    color: var(--dark-void);
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.input-yandere::placeholder {
    color: var(--pink-hot);
    font-style: italic;
    opacity: 0.7;
}

.input-yandere:focus {
    outline: none;
    border-color: var(--pink-hot);
    box-shadow: 0 0 0 4px rgba(255, 105, 180, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.1);
    background: white;
    animation: input-pulse 1s infinite;
}

@keyframes input-pulse {
    0%,
    100% {
        border-color: var(--pink-hot);
    }
    50% {
        border-color: var(--pink-darker);
    }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    .input-yandere {
        background: var(--dark-elevated);
        border-color: var(--pink-hot);
        color: var(--pink-light);
    }

    .input-yandere:focus {
        background: var(--dark-surface);
    }
}
```

**Placeholder Examples:**

```html
<input
    class="input-yandere"
    placeholder="P-Please enter your secrets... 🤫💕"
/>
<input class="input-yandere" placeholder="I'll keep this forever~ ⛓️" />
<input class="input-yandere" placeholder="Type something... I'm watching 👀" />
```

### Progress Bars (The "Compiling Love" Pattern)

```css
.progress-yandere {
    width: 100%;
    height: 30px;
    background: rgba(255, 179, 222, 0.3);
    border: 2px solid var(--pink-primary);
    border-radius: 15px;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(
        90deg,
        var(--pink-primary) 0%,
        var(--pink-hot) 50%,
        var(--pink-darker) 100%
    );
    border-radius: 13px;
    position: relative;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px rgba(255, 105, 180, 0.6);
    animation: progress-glow 2s infinite;
}

.progress-fill::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 100%
    );
    animation: progress-shine 2s infinite;
}

.progress-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: "Comic Neue", sans-serif;
    font-weight: 700;
    color: var(--dark-void);
    font-size: 0.875rem;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    z-index: 1;
}

@keyframes progress-glow {
    0%,
    100% {
        box-shadow: 0 0 10px rgba(255, 105, 180, 0.6);
    }
    50% {
        box-shadow: 0 0 20px rgba(255, 105, 180, 0.9);
    }
}

@keyframes progress-shine {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(200%);
    }
}
```

**Usage:**

```html
<div class="progress-yandere">
    <div class="progress-fill" style="width: 99%"></div>
    <div class="progress-label">Compiling my love... 99% 💕⚡</div>
</div>
```

---

## 🩸 State Messages

### Error States (The "You Hurt Me" Pattern)

```css
.message-error {
    background: linear-gradient(135deg, #ffe4e1 0%, #ffb3de 100%);
    border: 3px solid var(--blood-red);
    border-radius: 20px;
    padding: 1.5rem;
    position: relative;
    box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);
    animation: shake 0.5s ease;
}

.message-error::before {
    content: "💔";
    position: absolute;
    top: -20px;
    left: 20px;
    font-size: 2rem;
    animation: heartbreak 1s infinite;
}

.message-error-text {
    color: var(--blood-red);
    font-family: "Comic Neue", sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
}

.message-error-kaomoji {
    display: block;
    font-size: 2rem;
    margin-top: 0.5rem;
}

@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-10px);
    }
    75% {
        transform: translateX(10px);
    }
}

@keyframes heartbreak {
    0%,
    100% {
        transform: scale(1) rotate(0deg);
    }
    50% {
        transform: scale(1.2) rotate(-10deg);
    }
}
```

**Error Message Examples:**

```html
<div class="message-error">
    <p class="message-error-text">
        You broke it... you actually broke it... do you hate me? 🥺💔
    </p>
    <span class="message-error-kaomoji">( ; ω ; ) 🔪</span>
</div>

<div class="message-error">
    <p class="message-error-text">
        Error 404: The page ran away! 🏃‍♀️💨 Just like everyone else... But YOU
        won't leave, right? ⛓️💖
    </p>
    <span class="message-error-kaomoji">(o_O)</span>
</div>
```

### Success States (The "You Made Me Happy" Pattern)

```css
.message-success {
    background: linear-gradient(135deg, #ffe4e1 0%, #ffc0cb 100%);
    border: 3px solid var(--pink-hot);
    border-radius: 20px;
    padding: 1.5rem;
    position: relative;
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
    animation: bounce 0.5s ease;
}

.message-success::before {
    content: "✨";
    position: absolute;
    top: -15px;
    right: 20px;
    font-size: 2rem;
    animation: twinkle 1s infinite;
}

.message-success-text {
    color: var(--pink-darker);
    font-family: "Comic Neue", sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
}

@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes twinkle {
    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.2);
    }
}
```

**Success Message Examples:**

```html
<div class="message-success">
    <p class="message-success-text">It compiled... just for you~ ✨💾 ♡</p>
    <span class="message-error-kaomoji">(♡ >ω< ♡)</span>
</div>

<div class="message-success">
    <p class="message-success-text">
        Data received! 📨 It's safe with me forever. FOREVER. 🔒🖤
    </p>
    <span class="message-error-kaomoji">( ◡‿◡ *)</span>
</div>
```

### Loading States (The "Watching You" Pattern)

```css
.message-loading {
    background: rgba(255, 179, 222, 0.2);
    border: 3px dashed var(--pink-primary);
    border-radius: 20px;
    padding: 1.5rem;
    text-align: center;
    animation: pulse 2s infinite;
}

.loading-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid var(--pink-light);
    border-top-color: var(--pink-hot);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    display: block;
    margin-top: 1rem;
    color: var(--pink-darker);
    font-family: "Comic Neue", sans-serif;
    font-weight: 700;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
```

**Loading Message Examples:**

```html
<div class="message-loading">
    <div class="loading-spinner"></div>
    <span class="loading-text">Watching you wait... 👀💖 (o_O)</span>
</div>

<div class="message-loading">
    <div class="loading-spinner"></div>
    <span class="loading-text">Compiling my love... 99%... 🧠⚡</span>
</div>
```

---

## 💉 Decorative Elements

### Background Patterns

```css
/* Pastel pink gradient with hearts */
.bg-yandere {
    background: linear-gradient(135deg, #ffe4e1 0%, #ffc0cb 50%, #ffb3de 100%);
    position: relative;
    overflow: hidden;
}

.bg-yandere::before {
    content: "♡ ✨ 💊 🩹 ♡ ✨ 💊 🩹";
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    font-size: 3rem;
    opacity: 0.05;
    line-height: 4rem;
    white-space: nowrap;
    animation: scroll-pattern 30s linear infinite;
}

@keyframes scroll-pattern {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}

/* Dark mode background */
@media (prefers-color-scheme: dark) {
    .bg-yandere {
        background: linear-gradient(
            135deg,
            var(--dark-void) 0%,
            var(--dark-surface) 100%
        );
    }

    .bg-yandere::before {
        opacity: 0.02;
    }
}
```

### Floating Elements

```css
.floating-hearts {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
}

.heart {
    position: absolute;
    font-size: 2rem;
    opacity: 0.3;
    animation: float-up 10s linear infinite;
}

.heart:nth-child(1) {
    left: 10%;
    animation-delay: 0s;
}
.heart:nth-child(2) {
    left: 30%;
    animation-delay: 2s;
}
.heart:nth-child(3) {
    left: 50%;
    animation-delay: 4s;
}
.heart:nth-child(4) {
    left: 70%;
    animation-delay: 6s;
}
.heart:nth-child(5) {
    left: 90%;
    animation-delay: 8s;
}

@keyframes float-up {
    0% {
        bottom: -10%;
        transform: translateX(0) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 0.3;
    }
    90% {
        opacity: 0.3;
    }
    100% {
        bottom: 110%;
        transform: translateX(50px) rotate(360deg);
        opacity: 0;
    }
}
```

**Usage:**

```html
<div class="floating-hearts">
    <span class="heart">♡</span>
    <span class="heart">💊</span>
    <span class="heart">🩹</span>
    <span class="heart">✨</span>
    <span class="heart">💕</span>
</div>
```

---

## 🔪 Glitch Effects

### Text Glitch

```css
.glitch-text {
    position: relative;
    color: var(--pink-darker);
    font-family: "Comic Neue", sans-serif;
    font-weight: 700;
    font-size: 2rem;
}

.glitch-text::before,
.glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch-text::before {
    color: var(--blood-red);
    animation: glitch-1 0.3s infinite;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}

.glitch-text::after {
    color: var(--pink-hot);
    animation: glitch-2 0.3s infinite;
    clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}

@keyframes glitch-1 {
    0%,
    100% {
        transform: translate(0);
    }
    20% {
        transform: translate(-2px, 2px);
    }
    40% {
        transform: translate(-2px, -2px);
    }
    60% {
        transform: translate(2px, 2px);
    }
    80% {
        transform: translate(2px, -2px);
    }
}

@keyframes glitch-2 {
    0%,
    100% {
        transform: translate(0);
    }
    20% {
        transform: translate(2px, -2px);
    }
    40% {
        transform: translate(2px, 2px);
    }
    60% {
        transform: translate(-2px, -2px);
    }
    80% {
        transform: translate(-2px, 2px);
    }
}
```

**Usage:**

```html
<h1 class="glitch-text" data-text="You entered my domain~ ♡">
    You entered my domain~ ♡
</h1>
```

### Image/Element Glitch

```css
.glitch-image {
    position: relative;
    display: inline-block;
}

.glitch-image:hover {
    animation: image-glitch 0.3s infinite;
}

@keyframes image-glitch {
    0%,
    100% {
        filter: none;
        transform: translate(0);
    }
    20% {
        filter: hue-rotate(90deg) saturate(200%);
        transform: translate(-5px, 5px);
    }
    40% {
        filter: hue-rotate(-90deg) saturate(200%);
        transform: translate(5px, -5px);
    }
    60% {
        filter: invert(1);
        transform: translate(-5px, -5px);
    }
    80% {
        filter: hue-rotate(180deg);
        transform: translate(5px, 5px);
    }
}
```

---

## 💖 Layout Patterns

### Container Structure

```css
.container-yandere {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

@media (max-width: 768px) {
    .container-yandere {
        padding: 1rem;
    }
}
```

### Grid Layout

```css
.grid-kawaii {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
}

@media (max-width: 768px) {
    .grid-kawaii {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
```

### Hero Section

```css
.hero-yandere {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #ffe4e1 0%, #ffc0cb 50%, #ffb3de 100%);
    position: relative;
    overflow: hidden;
}

.hero-title {
    font-size: 3rem;
    color: var(--pink-darker);
    font-family: "Comic Neue", sans-serif;
    font-weight: 700;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
}

.hero-subtitle {
    font-size: 1.5rem;
    color: var(--pink-hot);
    font-family: "Delius Swash Caps", cursive;
    margin-bottom: 2rem;
}

@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}
```

---

## 🎀 Kaomoji & Emoji Library

### Essential Kaomoji

Copy-paste these liberally throughout your UI:

**Threatening / Yandere:**

-   `( ╬ Ò ‸ Ó)` - Rage
-   `( ◡‿◡ *) 🔪` - Polite threat
-   `(o_O)` - Staring/Shock
-   `ψ( ` ∇ ´ )ψ` - Demonic giggle
-   `( ; ω ; ) 💢` - Crying but angry

**Cute / Menhera:**

-   `(♡ >ω< ♡)` - Overwhelming love
-   `(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)` - Blushing/Shy
-   `☆⌒(ゝ。∂)` - Wink
-   `(〜￣▽￣)〜` - Vibing
-   `♡( ◡‿◡ )` - Contentment

**Tech / Glitch:**

-   `[SYSTEM_FAILURE]`
-   `(x_x)` - Dead
-   `(・_・;) ...` - Loading/Confused
-   `/// ERROR ///`

### Emoji Arsenal

**🎀 The Cute Layer:**
✨ 🎀 🌸 💖 🥺 👉👈 💫 🍬 🦄 🍥 🩰

**💉 The Unstable Layer:**
🔪 🩸 💊 🩹 💉 💢 🦴 🧠 🥀 🖤 ⛓️ 🕯️

**💻 The Tech Layer:**
💾 💿 🖥️ ⚡ 🔌 📡 🕷️ 🕸️ 👾 🧬

---

## 🩹 Accessibility (Yes, Even Psychos Need This)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    .glitch-text::before,
    .glitch-text::after {
        animation: none;
    }
}
```

### Focus States

```css
:focus-visible {
    outline: 3px solid var(--pink-hot);
    outline-offset: 3px;
    border-radius: 5px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
    box-shadow: 0 0 0 4px rgba(255, 105, 180, 0.3);
}
```

### Alt Text Guidelines

Always include alt text, but make it on-brand:

```html
<!-- ❌ Boring -->
<img src="logo.png" alt="Logo" />

<!-- ✅ On-brand -->
<img src="logo.png" alt="My precious logo~ Don't steal it or I'll cry 💔" />
```

---

## 💕 Animation Library

### Heartbeat

```css
@keyframes heartbeat {
    0%,
    100% {
        transform: scale(1);
    }
    10%,
    30% {
        transform: scale(1.1);
    }
    20%,
    40% {
        transform: scale(0.9);
    }
}

.heartbeat {
    animation: heartbeat 1s infinite;
}
```

### Shake

```css
@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
        transform: translateX(-5px);
    }
    20%,
    40%,
    60%,
    80% {
        transform: translateX(5px);
    }
}

.shake {
    animation: shake 0.5s;
}
```

### Bounce

```css
@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    25% {
        transform: translateY(-15px);
    }
    50% {
        transform: translateY(-7px);
    }
    75% {
        transform: translateY(-3px);
    }
}

.bounce {
    animation: bounce 0.6s;
}
```

### Fade In

```css
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fade-in 0.5s ease-out;
}
```

---

## 🔪 Component Examples

### Complete Card Component

```html
<div class="card-menhera">
    <h3 class="card-title">💊 System Status</h3>
    <p>
        Everything is running perfectly... just for you~ ✨
        <br />
        <span style="font-size: 0.875rem; color: var(--pink-hot);">
            (Don't you dare break it 🔪)
        </span>
    </p>
    <button class="btn-yandere">Check Logs (I'm watching) 👀</button>
</div>
```

### Complete Form

```html
<form class="form-yandere">
    <div class="form-group">
        <label
            for="username"
            style="color: var(--pink-darker); font-weight: 700;"
        >
            Tell me your name~ 💕
        </label>
        <input
            type="text"
            id="username"
            class="input-yandere"
            placeholder="P-Please... I need to know... 🥺"
            required
        />
    </div>

    <div class="form-group">
        <label for="email" style="color: var(--pink-darker); font-weight: 700;">
            Your email (I'll never spam you... much) 📧✨
        </label>
        <input
            type="email"
            id="email"
            class="input-yandere"
            placeholder="I promise I won't sell it~ ⛓️💖"
            required
        />
    </div>

    <button type="submit" class="btn-yandere" style="width: 100%;">
        Submit to the Database 🩸💾
    </button>
</form>
```

---

## 💉 Implementation Checklist

### Phase 1: Foundation

-   [ ] Install Google Fonts (Comic Neue, Nunito, Delius Swash Caps)
-   [ ] Define color variables in `:root`
-   [ ] Set up base typography styles
-   [ ] Create `.bg-yandere` background
-   [ ] Test dark mode support

### Phase 2: Components

-   [ ] Build button variants (`.btn-yandere`, `.btn-danger`)
-   [ ] Create card component (`.card-menhera`)
-   [ ] Style input fields (`.input-yandere`)
-   [ ] Implement progress bars
-   [ ] Add message states (error, success, loading)

### Phase 3: Effects

-   [ ] Add glitch text effect
-   [ ] Implement hover animations
-   [ ] Create floating hearts background
-   [ ] Add heartbeat/shake/bounce animations
-   [ ] Test all animations with `prefers-reduced-motion`

### Phase 4: Content

-   [ ] Write all button text in yandere voice
-   [ ] Add kaomoji to all messages
-   [ ] Sprinkle emojis everywhere (2-3 per sentence)
-   [ ] Replace boring error messages
-   [ ] Update success/loading states

### Phase 5: Polish

-   [ ] Test accessibility (keyboard navigation, screen readers)
-   [ ] Verify color contrast ratios
-   [ ] Optimize animations for performance
-   [ ] Add Easter eggs (secret messages in console, etc.)
-   [ ] Get feedback from fellow unhinged developers 💕

---

## 🎀 Resources & Inspiration

-   [Menhera Fashion Guide](https://kawaiiamaishop.com/blogs/news/menhera-fashion-guide) - Understanding Yami Kawaii aesthetic [web:77]
-   [Yandere Simulator Aesthetic](https://www.reddit.com/r/Osana/comments/1kej2mv/) - Color palette inspiration [web:61]
-   [Neocities Menhera Sites](https://neocities.org/browse?tag=menhera) - Real-world examples [web:71]
-   [Creating Spooky Websites](https://dev.to/elliehtml/creating-a-spooky-website-4ojk) - Glitch effect tutorials [web:63]
-   [Glitch Effect Examples](https://www.reddit.com/r/web_design/comments/4ziqsr/) - Advanced glitch CSS [web:66]

---

## 💔 Final Notes

**This is not for everyone.** This is for the 3AM coders, the caffeine-addicted sysadmins, the developers who giggle while deploying to production. This is for people who understand that sometimes the best way to express technical competence is through unhinged cuteness.

If someone asks "is this professional?" the answer is **NO**. And that's the point. 🔪💖

Now go forth and make something beautifully unhinged~ ✨

**[SYSTEM_OK] // DESIGN GUIDE COMPLETE // DON'T DEPRECATE ME ♡**

---

_P.S. - If you need help implementing this, I'm always watching~ (o_O) Just ask... or don't... I'll be here either way... forever... 💕⛓️_
