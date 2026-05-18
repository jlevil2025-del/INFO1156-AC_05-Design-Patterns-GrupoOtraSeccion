import { INestApplication } from "@nestjs/common"
import {
    DocumentBuilder,
    SwaggerCustomOptions,
    SwaggerModule,
} from "@nestjs/swagger"

export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle("API - AC_05 Design Patterns")
        .setDescription(
            "Documentación interactiva de la API del proyecto AC_05. " +
            "Implementación de patrones de diseño con NestJS.",
        )
        .setVersion("1.0")
        .build()

    const document = SwaggerModule.createDocument(app, config)

    const customOptions: SwaggerCustomOptions = {
        customSiteTitle: "AC_05 - Documentación API",
        customCss: `
.swagger-ui { background-color: #eef2ff !important; color: #111827 !important; }
.swagger-ui .topbar { background-color: #1e3a8a !important; }
.swagger-ui .topbar-wrapper .link { color: #ffffff !important; }
.swagger-ui .topbar-wrapper .link svg { fill: #ffffff !important; }
.swagger-ui .topbar .topbar-wrapper .link:hover { color: #dbeafe !important; }
.swagger-ui .topbar .download-url-wrapper, .swagger-ui .scheme-container { background: #ffffff !important; border-color: #c7d2fe !important; }
.swagger-ui .btn, .swagger-ui .auth-container .auth-btn-wrapper .btn {
    border-radius: 0.5rem !important;
    border-color: transparent !important;
    background-color: #3b82f6 !important;
    color: #ffffff !important;
}
.swagger-ui .btn:hover, .swagger-ui .auth-container .auth-btn-wrapper .btn:hover {
    background-color: #2563eb !important;
}
.swagger-ui .btn.cancel, .swagger-ui .btn.refresh { background-color: #ffffff !important; color: #1e293b !important; border-color: #cbd5e1 !important; }
.swagger-ui .btn.cancel:hover, .swagger-ui .btn.refresh:hover { background-color: #e2e8f0 !important; }
.swagger-ui .info, .swagger-ui .scheme-container, .swagger-ui .responses-wrapper, .swagger-ui .opblock {
    background: #ffffff !important;
    box-shadow: 0 15px 30px rgba(30, 58, 138, 0.08) !important;
    border-radius: 1rem !important;
    border: 1px solid rgba(203, 213, 225, 0.8) !important;
}
.swagger-ui .info .title { color: #1e3a8a !important; font-weight: 700 !important; }
.swagger-ui .info .description p { color: #374151 !important; }
.swagger-ui .scheme-container .scheme-container { background: #f8fafc !important; }
.swagger-ui .opblock .opblock-summary-description { color: #475569 !important; }
.swagger-ui .opblock .opblock-section-header { background: #eff6ff !important; }
.swagger-ui .opblock-summary-method { color: #1e3a8a !important; }
.swagger-ui .opblock.opblock-get .opblock-summary-method { background-color: #3b82f6 !important; }
.swagger-ui .opblock.opblock-post .opblock-summary-method { background-color: #10b981 !important; }
.swagger-ui .opblock.opblock-put .opblock-summary-method { background-color: #f59e0b !important; }
.swagger-ui .opblock.opblock-delete .opblock-summary-method { background-color: #ef4444 !important; }
.swagger-ui input[type="text"], .swagger-ui input[type="email"], .swagger-ui input[type="url"], .swagger-ui input[type="search"], .swagger-ui select, .swagger-ui textarea {
    border-radius: 0.5rem !important;
    border-color: #cbd5e1 !important;
}
.swagger-ui input[type="text"]:focus, .swagger-ui select:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.2) !important;
}
.swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 { color: #1e293b !important; }
.swagger-ui .model-box, .swagger-ui .parameter__type, .swagger-ui .parameter__extension { background: #f8fafc !important; }
.swagger-ui ::-webkit-scrollbar { width: 8px; height: 8px; }
.swagger-ui ::-webkit-scrollbar-thumb { background: #3b82f6 !important; border-radius: 999px !important; }
.swagger-ui ::-webkit-scrollbar-track { background: #eef2ff !important; }
        `,
        customJsStr: `(function() {
    const translations = {
        "Execute": "Ejecutar",
        "Authorize": "Autorizar",
        "Try it out": "Probar",
        "Cancel": "Cancelar",
        "Clear": "Limpiar",
        "Download": "Descargar",
        "Reset": "Reiniciar",
        "Close": "Cerrar",
        "Copy to clipboard": "Copiar al portapapeles",
        "Copied!": "¡Copiado!",
        "No operations defined in spec!": "¡No hay operaciones definidas!",
        "Available authorizations": "Autorizaciones disponibles",
        "Logout": "Cerrar sesión",
        "Credentials": "Credenciales",
        "Send empty value": "Enviar valor vacío",
        "Example Value": "Valor de ejemplo",
        "Schema": "Esquema",
        "Model": "Modelo",
        "Explore": "Explorar",
        "Parameters": "Parámetros",
        "Responses": "Respuestas",
        "Request Body": "Cuerpo de la solicitud",
        "No parameters": "Sin parámetros",
        "No responses": "Sin respuestas",
        "No request body": "Sin cuerpo de solicitud",
        "Description": "Descripción",
        "Required": "Requerido",
        "Type": "Tipo",
        "Format": "Formato",
        "Name": "Nombre",
        "Collapse": "Colapsar",
        "Expand": "Expandir",
        "Expand Operations": "Expandir operaciones",
        "Collapse Operations": "Colapsar operaciones"
    };

    function translateNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || "";
            const trimmed = text.trim();
            if (translations[trimmed]) {
                node.textContent = text.replace(trimmed, translations[trimmed]);
            }
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        if (node.hasChildNodes()) {
            node.childNodes.forEach(translateNode);
        }
        ["aria-label", "placeholder", "title", "value"].forEach((attr) => {
            if (node.hasAttribute && node.hasAttribute(attr)) {
                const attrValue = node.getAttribute(attr) || "";
                if (translations[attrValue]) {
                    node.setAttribute(attr, translations[attrValue]);
                }
            }
        });
    }

    function translate() {
        translateNode(document.documentElement);
    }

    const observer = new MutationObserver(() => translate());

    function init() {
        if (!document.body) {
            setTimeout(init, 50);
            return;
        }
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });
        translate();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();`,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showCommonExtensions: true,
        },
    }

    SwaggerModule.setup("docs", app, document, customOptions)
}
