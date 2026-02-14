const getBackendUrl = () => {
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:3000`;
    }
    return "http://localhost:3000";
};

export const API_URL = getBackendUrl();
