# Michele's headshot

Save the headshot photo in this folder as **`michele.jpg`** (exact name, lowercase).

- Path: `public/michele.jpg`
- The homepage story section shows it automatically via `components/MicheleAvatar.tsx`.
- Until the file exists, the page falls back to the "MC" monogram — nothing breaks.
- A square-ish crop centred on the face looks best (it's shown in a circle).

After adding it:

```
git add public/michele.jpg
git commit -m "Add Michele headshot"
git push
```

Vercel redeploys and the photo goes live.
