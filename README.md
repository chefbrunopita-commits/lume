# Lume

Assistente local no estilo Grok. A inteligência vem do **Llama instalado no seu computador** — Ollama, LM Studio ou llama.cpp. As conversas ficam só neste aparelho.

Repositório público: [github.com/chefbrunopita-commits/lume](https://github.com/chefbrunopita-commits/lume)

## O que é

O Lume nasceu de um pedido simples: um chat com cara de Grok, rodando num MacBook Pro M3, falando com o Llama que já estava na máquina. Nesta versão open source qualquer pessoa pode clonar, instalar e usar no próprio computador.

- Interface escura, compositor central, histórico na lateral
- Llama 4 (Scout / Maverick) em primeiro lugar; cai para Llama 3.3 / 3.2 / 3.1 se for o que estiver instalado
- Streaming token a token (API compatível com OpenAI)
- Conversas no `localStorage`
- Nuvem opcional (qualquer endpoint `/v1/chat/completions`)

## Requisitos

- Node.js 22+
- Um servidor local de Llama:
  - [Ollama](https://ollama.com) (recomendado) — `ollama pull llama4` ou `ollama pull llama3.2`
  - [LM Studio](https://lmstudio.ai)
  - [llama.cpp](https://github.com/ggml-org/llama.cpp) `llama-server`

## Começar

```bash
git clone https://github.com/chefbrunopita-commits/lume.git
cd lume
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (em geral `http://127.0.0.1:5173`). Deixe o Ollama aberto, toque em **Testar conexão**.

## Atalhos

| Tecla | Ação |
| --- | --- |
| Enter | Enviar |
| Shift+Enter | Nova linha |
| Ctrl/Cmd+Shift+O | Nova conversa |

## Licença

MIT. Veja [LICENSE](LICENSE).
