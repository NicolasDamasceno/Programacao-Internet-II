# Mini-Prontuário — Camadas, Erros, Validação e Upload

Projeto-fio do Tópico 2 (Programação para Internet II, IFPI): API REST em
camadas (Route → Controller → Service), tratamento central de erros,
validação com Zod e upload de foto de paciente.

## Auditoria de segurança do upload de foto (Nível 3)
> Ao tentar procurar um arquivo diferente de um jpeg ou png, o explorador
> apenas deixou apenas disponível o tipo correto dos arquivos, porém o file fillter
> realiza a verificação do tipo de arquivo enviado permitindo apenas o tipo definido
> ser aceito no upload.
> Uma segurança de tamanho foi implementada, ao tentar cadastrar com uma 
> foto de 2MB ou maior, o endpoint retornou um 413 de PayLoad muito grande.
> Uma medida de segurança é o nome que as fotos agora são salvas com nomes
> diferentes do nome original do disco, isso evita que duas fotos de mesmo
> nome de dois usuários diferentes e também evita nomes eviados por usuários
> mal intencionados.
> Isso mostra que mesmo um endpoint simples para fazer uploads de fotos deve 
> passar por medidas de segurança das fotos enviadas e do próprio sistema.
> Vale ressaltar que o endpoint não possue uma proteção por login ou atenticação
> ainda porque ainda não chegamos nessa parte em nosso estudo.
