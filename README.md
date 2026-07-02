# Lumina ERP - Paz Bookstore Edition 📚🚀

O **Lumina ERP** é um sistema de gestão empresarial customizado desenvolvido em React para otimizar as operações diárias, controle de estoque e análise financeira de uma livraria varejista. O sistema foi projetado para resolver problemas logísticos e de controle de dados do mundo real com foco em alta performance e interface intuitiva.

---

## 🔗 Demonstração

*   **Acesso Online (Live Demo):** [lumina-erp-rose.vercel.app](https://lumina-erp-rose.vercel.app)
*   **Tecnologias Utilizadas:** React, Vite, Tailwind CSS, Lucide React, Firebase.

---

## 🛠️ Funcionalidades Principais

*   **Gestão de Consignados:** Controle rigoroso e centralizado de livros recebidos por consignação, monitorando prazos de acerto, devoluções pendentes e repasses financeiros aos fornecedores.
*   **Analytics & Dashboard de Vendas:** Gráficos interativos em tempo real exibindo receita bruta, lucro real, margem de lucro acumulada e alertas automáticos de estoque crítico.
*   **Módulo de Importação/Exportação CSV:** Ferramenta ágil para importação em lote de inventários e exportação de relatórios de vendas em formato CSV para contabilidade.
*   **Otimização de Busca:** Sistema de pesquisa dinâmica e filtragem avançada de produtos por título, autor ou código de barras.

---

## 💡 Diferenciais Técnicos & Performance

### Gráficos Nativos em SVG (Sem Dependências Pesadas)
Para manter o *bundle size* da aplicação o mais leve possível e garantir um carregamento instantâneo (especialmente em conexões móveis), **toda a renderização gráfica e de dashboards foi desenvolvida nativamente em SVG** acoplada ao ciclo de vida do React. 

Ao optar por não utilizar bibliotecas externas pesadas de terceiros (como *Chart.js* ou *Recharts*), o projeto eliminou códigos redundantes, resultando em:
1.  **Carregamento Ultra-Rápido:** Menos código enviado ao navegador do usuário.
2.  **Responsividade Fluida:** Gráficos que escalam perfeitamente em qualquer resolução de tela sem travamentos.
3.  **Código Limpo:** Total controle sobre a estilização e animações das barras e métricas através do Tailwind CSS.

---

## 📁 Estrutura do Projeto

```text
lumina-erp/
├── src/
│   ├── components/     # Componentes visuais reutilizáveis
│   ├── context/        # Gerenciamento de estado global
│   ├── pages/          # Telas principais (Painel, Consignados, Caixa)
│   ├── App.jsx         # Componente raiz da aplicação
│   └── main.jsx        # Ponto de entrada do React
├── index.html          # Estrutura base HTML5
├── package.json        # Dependências e scripts do projeto
├── tailwind.config.js  # Customização do ecossistema visual
└── postcss.config.js   # Plugins de otimização de estilos
