export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        chrome: "#f5c400",
        charcoal: "#18181b",
        steel: "#3f3f46"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0,0,0,0.12)"
      }
    }
  },
  plugins: []
};
