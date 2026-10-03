<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Program content lives in src/lib/mrc-data.ts and renders via /programs/$slug — keeps one template for all programs.
- Glass surfaces use .glass/.glass-lg/.glass-ink and .btn-* classes in styles.css — keeps the look consistent.
- Data access uses the browser client with RLS; admin rights come from user_roles via has_role — first signup becomes admin.
