# Instalacje 

node -v
npm -v 
git -v 

# GIT 
git clone ...

CTRL+SHIFT+P  -> CLONE -> paste -> url -> destination -> open..

https://github.com/ev45ive/sages-angular-adv-1126

# Angular CLI
ng version
Angular CLI       : 22.2.5

npm i -g @angular/cli@latest
npm i -g @angular/cli@^22.0.0
npm i -g @angular/cli@22.2.5

# ng new - workspace

ng new sages --directory "." -s -t --skip-tests --routing --ssr true --standalone true --style tailwind --zoneless false

# npm + semver + package-lock.json
https://semver.org/
https://semver.npmjs.com/

npm i  // package.json upgrade
npm ci // package-lock.json exact


# Material
ng add @angular/


# Design Tokens

https://m3.material.io/foundations/design-tokens/overview
https://v21.primeng.org/theming/styled#architecture

# Flex
https://css-tricks.com/snippets/css/a-guide-to-flexbox/

http://www.flexboxdefense.com/
https://flexboxfroggy.com/


# CSS GRID
https://css-tricks.com/complete-guide-css-grid-layout/
https://cssgridgarden.com/


# CSS Specifity
https://css-tricks.com/specifics-on-css-specificity/ 



# Decision Criteria - Constraints / Forcing Functions

- Reusability - DRY-3x / YAGNI

- Responsibility - SRP - Single Reason to Change
        - What will change together says together
        - What will change separatly gets separated

- Extensibility 
        - Open/Closed - If its different responsibility:
        - Use extension/port/outlet/input/slot/params/...

- Ownership
    - who can change this, upstream to consumers (dependecies)

- Scope
    - Impact radius - what dependecies will be affected

- Lifecyle 
    - When it is created, changes state and destoryed
    - How often it changes state
    - Rate of change (how often it changes, together with what)
    - Staleness budget, invaidation etc..



# Komponenty

ui - Komponent "prezentacyjny" - zależy od rodzica (page)
page - Komponent "kontrolujący" - ładuje dane dla dzieci (ui)


# Open questions 
- Is app layout core/shared/feature? Depends on ... ?

# Core/Shared/Features