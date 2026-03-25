/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        tide: "#0D3B66",
        ember: "#F95738",
        mist: "#F2F5F7",
        pine: "#1B4332"
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 35px -20px rgba(13, 59, 102, 0.45)"
      }
    }
  },
  plugins: []
};
