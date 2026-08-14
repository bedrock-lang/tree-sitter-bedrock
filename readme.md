# tree-sitter-bedrock

Tree-sitter grammar for the **Bedrock** programming language.

## Features

- **Complete Syntax Coverage**: Supports top-level definitions, imports, generics, structs, enums, pattern matching, dynamic expressions, and higher-order function types.
- **Pre-compiled Parser**: Includes pre-generated `src/parser.c` for immediate integration without requiring Node.js or the Tree-sitter CLI at build time.
- **Editor Ready**: Ready for integration with Neovim, Helix, and other Tree-sitter powered tools.

---

## Installation & Usage

### Prerequisites

- [Node.js](https://nodejs.org/)
- A C compiler (`gcc` or `clang`)

1. **Clone the tree-sitter-bedrock repo**

2. **Go into the repo directory**

3. **Run these commands:**

```bash
npx tree-sitter generate
npx tree-sitter build -o bedrock.so
```

### Neovim Integration (`nvim-treesitter`)

Add the parser to your neovim configuration (tree-sitter-setup):

1. **Store the parser in a nice place**

```lua
mkdir ~/.config/nvim/parser
cp /path/to/bedrock.so ~/.config/nvim/parser
```

2. **Store highlights.scm exactly here**

```
mkdir -p ~/.config/nvim/queries/bedrock
cp /path/to/highlights.scm ~/.config/nvim/queries/bedrock
```

3. **Register .bok filetype**

> copy this snippet anywhere in your nvim config, I have done it in my `options.lua`

```lua
vim.filetype.add({
  extension = {
    bok = 'bedrock',
  },
})
```

4. **autocmd to start tree-sitter**

> put this snippet in your autocmds file or init.lua

```lua
vim.api.nvim_create_autocmd('FileType', {
  pattern = 'bedrock',
  callback = function()
    vim.treesitter.start()
  end,
})
```

## Development

If you are modifying `grammar.js`, you need to regenerate the parser files and run tests.
