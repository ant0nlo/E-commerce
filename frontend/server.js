const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve the frontend build
app.use(express.static('build'));

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
    target: 'http://18.206.137.223:4000',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
