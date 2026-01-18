window.addEventListener('load', () => {
    const swaggerUI = window.ui;
    if (!swaggerUI) {
        return;
    }

    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
        const response = await originalFetch(url, options);

        if (url.toString().includes('/api/v1/user/login') && response.ok) {
            const responseClone = response.clone();
            try {
                const body = await responseClone.json();
                if (body.accessToken) {
                    swaggerUI.preauthorizeApiKey('bearerAuth', body.accessToken);
                }
            } catch (e) {
                console.error("Error parsing login response", e);
            }
        }

        return response;
    };
});
