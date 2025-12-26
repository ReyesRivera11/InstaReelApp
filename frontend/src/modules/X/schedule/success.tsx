import { useEffect } from "react"

export default function XOAuthSuccessPage() {
    useEffect(() => {
        if (window.opener) {
            window.opener.postMessage(
                { type: "X_OAUTH1_SUCCESS" },
                window.location.origin
            )
        }
        window.close()
    }, [])


    return (
        <div style={{ padding: 20 }}>
            <p>Autorización completada. Cerrando ventana…</p>
        </div>
    )
}
