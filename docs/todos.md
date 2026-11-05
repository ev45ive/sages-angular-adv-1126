# TODOs

- **Pipes depend on `DealsStore` (ui -> data).** `AccountNamePipe` and `ContactNamePipe` inject `DealsStore`, which breaks the ui-only layering. Options: pass names into the components as inputs, or move the lookup to the page.
- **`DealEditor` header is static.** The header always reads "Edit Deal", including in creator mode. Fix: derive the header from the deal, or pass a title input.
