# Standardized API Response and Error Envelope

All HTTP endpoints will format responses using a standardized JSON envelope (`{ success: true, data: T }` for successful requests and `{ success: false, error: { message, code, details? } }` for failures). This establishes a predictable contract for frontend Axios interceptors and simplifies global error handling across all backend modules.
