/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        papel: "#F6F4EE",
        cartao: "#FFFFFF",
        tinta: { DEFAULT: "#15191E", 2: "#4A525C", 3: "#8A929B" },
        linha: "#E3DFD5",
        acao: { DEFAULT: "#D8432A", escuro: "#B23320", claro: "#FBE9E4" },
        tatame: { DEFAULT: "#1F5E4B", claro: "#E4EFEA" },
        aviso: { DEFAULT: "#B7791F", claro: "#FBF1DC" },
      },
      fontFamily: {
        display: ['"Archivo"', "sans-serif"],
        sans: ['"IBM Plex Sans"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: { cartao: "0 1px 0 rgba(21,25,30,.04), 0 8px 24px -12px rgba(21,25,30,.12)" },
    },
  },
  plugins: [],
};
