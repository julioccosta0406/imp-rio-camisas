IMPÉRIO CAMISAS — versão pronta para Vercel

1. Abra esta pasta no VS Code.
2. Em script.js, troque 5500000000000 pelo WhatsApp real da loja.
3. O site usa as imagens extraídas do ZIP.
4. Categorias só são atribuídas automaticamente quando o nome do arquivo dá suporte. Arquivos sem identificação ficam em "Outros", para evitar colocar uma camisa no time errado.
5. Para publicar: suba a pasta para um repositório GitHub e importe o repositório na Vercel, ou use o Vercel CLI.

CORREÇÃO: produtos sem tamanhos cadastrados agora mostram P, M, G, GG e 2XL em botões clicáveis.



CONTROLE DE TAMANHOS / ESTOQUE
Os tamanhos agora aparecem como botões clicáveis no produto. Não existe mais "Consultar disponibilidade".

Para tirar um tamanho que acabou do estoque:
1. Abra o arquivo index.html no VS Code.
2. Procure pelo produto usando o campo "id" ou pelo nome/imagem.
3. Dentro desse produto, localize a linha "sizes".
4. Deixe somente os tamanhos que ainda estão disponíveis.
   Exemplo: "sizes": ["P", "M", "G", "GG", "2XL"]
   Se o GG acabar, altere para: "sizes": ["P", "M", "G", "2XL"]
5. Salve o arquivo e publique novamente na Vercel/GitHub.

Se todos os tamanhos acabarem, deixe "sizes": [].
Nesse caso o produto aparece como ESGOTADO e não pode ser adicionado ao carrinho.
