/** @type {import('tailwindcss').Config} */
// Paleta e ritmo inspirados na referência visual indicada pelo fundador (13/10/2026):
// fundo cinza-azulado muito claro, cartões brancos, azul-marinho como cor principal e amarelo como destaque.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        papel: "#F7F9FC",
        cartao: "#FFFFFF",
        tinta: { DEFAULT: "#1D1E1F", 2: "#4A525C", 3: "#8791A0" },
        linha: "#E3E8F0",
        marinho: { DEFAULT: "#1A447D", escuro: "#143660", claro: "#E9EFF7" },
        // "acao" segue o marinho: é a cor de links e de estados ativos
        acao: { DEFAULT: "#1A447D", escuro: "#143660", claro: "#E9EFF7" },
        ouro: { DEFAULT: "#FAAB19", escuro: "#D98E06", claro: "#FEF3DA" },
        tatame: { DEFAULT: "#1F8A5B", claro: "#E6F4EC" },
        aviso: { DEFAULT: "#A16207", claro: "#FEF3DA" },
        perigo: { DEFAULT: "#C8372D", claro: "#FBEAE8" },
      },
      fontFamily: {
        display: ['"Inter"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"Inter"', "system-ui", "sans-serif"],
        placar: ['"Sofia Sans Extra Condensed"', '"Arial Narrow"', "system-ui", "sans-serif"],
      },
      boxShadow: { cartao: "0 1px 2px rgba(26,68,125,.04), 0 6px 20px -10px rgba(26,68,125,.14)" },
    },
  },
  plugins: [],
};
