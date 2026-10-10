#!/bin/bash

npx tree-sitter generate
npx tree-sitter build -o bedrock.so

mkdir -p ~/.config/nvim/parser
cp bedrock.so ~/.config/nvim/parser

mkdir -p ~/.config/nvim/queries/bedrock
cp queries/highlights.scm ~/.config/nvim/queries/bedrock
