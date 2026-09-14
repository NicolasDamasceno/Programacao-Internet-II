# Mini-Prontuário — Camadas, Erros, Validação e Upload

Projeto-fio do Tópico 2 (Programação para Internet II, IFPI): API REST em
camadas (Route → Controller → Service), tratamento central de erros,
validação com Zod e upload de foto de paciente.

## Auditoria de segurança do upload de foto (Nível 3)

> Preencha esta seção você mesmo. Ela deve refletir o que **você**
> verificou manualmente no endpoint `POST /api/patients/:id/photo` — não
> uma lista genérica. Abaixo, um roteiro de perguntas para te ajudar a
> escrever cada item; apague as perguntas depois de responder.

### O que eu verifiquei

- **Tipo de arquivo**: o que acontece se eu mandar um arquivo com
  `Content-Type` diferente de `image/jpeg`/`image/png`? Eu testei isso?
  Qual status voltou?
- **Tamanho**: eu de fato mandei um arquivo maior que 2MB e vi o `413`?
  O que o corpo da resposta mostrou?
- **Nome do arquivo salvo em disco**: eu abri a pasta `uploads/` depois de
  um upload e conferi o nome do arquivo gerado? Ele tem alguma relação
  com o nome original que eu enviei?

### O que eu sei que ainda não está protegido

Dica: pense em quem pode chamar esse endpoint hoje (existe autenticação?
qualquer pessoa que descubra a URL pode subir uma foto para qualquer
paciente?), e no que acontece se o `Content-Type` declarado pelo cliente
não corresponder ao conteúdo real do arquivo (o `fileFilter` confia em
`file.mimetype` — de onde vem esse valor, e quem o define?).
