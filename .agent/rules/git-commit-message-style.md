---
trigger: always_on
---

# Git commit rules
- Only commit when I say to
- Dont commit until i said it
- Make the commit message more descriptive and technical
- Dont stage and add the .agent folder
- Follow the commit style

## Commit Style
- When making commits follow this type & style of commit message
Example:
```
f65ed76 (HEAD -> master, origin/master) feat: modularize hero components + animations init & polishes
0942ba5 feat: info section done, still needs polish
e4b1dce feat: info section & title, btn, menu and socials
9c6d60e feat: added ambient module declarations
be68c47 feat: hero__title & hero__description using proper geist pixel font
c12dd6b feat: set geist pixel fonts via _typography.css + polishes
d3423c3 feat: layout 12 grid overlay toggle using shift+g & contact btn
a0e6633 feat: 12 column grid overlay & layout via all sections
3fd4cc3 feat: aikhe logo mark svg & image optimization
131f57b feat: getting used to web dev again for the 1000th time
01a3268 feat: setting & keeping the fundamentals
6ec1ac0 feat(docs): getting though sveltekit documentations
6615588 build: sveltekit init via vite
7f49d82 feat(blog): render images within the rich text & portable text section + fix styling
0d62f60 feat(blog): individual blog view & links + useBlog composable + added BLOG to navlinks
cf94401 feat(blog): polish design to fit the whole web aesthetic
3edcc1f feat(blog): blog layout displays each blog metadata
b03f41b feat(types): oraganized types for blog + types struct initial
52cf37a chore: clean up schema definitions + good session
9b3e62f feat(blog): image optimization with ImageUrlBuilder + @portabletext/vue & @sanity/image-url
51e6b80 feat(blog): implement portable text for rich text (will get images working)
8ae2359 chore: zero
e0e5f1a feat(dependency): @portabletext/vue
3521b93 feat(blog): cover image & content as json format (will fix)
9cbb4c6 feat(blogs): fixed GROQ syntax (can't use dot annotations for projections) + fetch on composable creation
5270277 feat(blogs): linked sanity data + useBlog composable & Blog interface
4a44965 chore: remove sanity cache within root
26247fe build: link both frontend and studio to master branch
e7feafb feat(sanity): define client + utilized process.env for easier migration
d03c7c7 feat(sanity): install @sanity/client dependency + configure client
cc06569 feat(meta): final meta img & setup
5c1d352 feat(meta): revert back meta image to 1200x630 + new design
a619168 feat(meta): check for high quality meta img
14fb21b feat(meta): remove 1200x630 meta img
b4887f7 feat(meta): set dimension to 200x200 meta image
5f5fe20 feat(meta): check diff dimension for meta image
392363a feat(meta): proper description base of now + testing meta images
d2530d8 feat(meta): sync with metatags io property
4fe88a0 feat(meta): disable twitter card meta tags
```
- When I asked for you to make a commit base of the current diff and chat history, use the commit style i have within this project. also im using powershell.
- Dont make the commit look like this:
```
feat(ui): my commit
Summary:
```
Instead only oneline and if its too long wrap just right after + or &
- Use "+" for connecting new message
- Use "&" for adding up to the message that is correlated to each other