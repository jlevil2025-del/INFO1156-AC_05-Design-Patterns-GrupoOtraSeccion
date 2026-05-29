# Actividad 5: Patrones de Diseño y Código Limpio

## Información del Grupo

- **Repositorio Fork:** `jlevil2025-del/INFO1156-AC_05-Design-Patterns-GrupoOtraSeccion`
- **Integrantes:**
    - Bárbara Arriagada
    - Jaime Levil
    - Leonel Chaves
    - Alan Bernales

---

## 1. Problemas Identificados (Diagnóstico Arquitectónico)

Al analizar el estado inicial del servidor en `src/posts/posts.controller.ts`, se detectaron severas falencias de arquitectura y violaciones a los principios de diseño de software:

- **Fat Controller (Controlador Saturado):** El controlador asumía responsabilidades de lógica de negocio profunda, cálculos matemáticos inline (método `getFeed`), y orquestación de efectos secundarios. Esto violaba flagrantemente el **Principio de Responsabilidad Única (SRP)**.
- **Acoplamiento Rígido en Efectos Secundarios:** Las funciones `logDomainEvent`, `fakeSendNotification` y `fakeRecomputeSomething` estaban acopladas inline dentro de los endpoints de creación, comentarios y likes. Agregar una nueva acción secundaria requería modificar directamente el controlador, violando el **Principio de Abierto/Cerrado (OCP)**.
- **Dependencia de Interfaces Inestables (Legacy Client):** El endpoint de comentarios interactuaba directamente con `legacyModerationApi.review()`, el cual retornaba tipos de datos inconsistentes (`string`, `number`, `object`). El controlador se veía obligado a implementar condicionales complejos (`if-else`) para normalizar la respuesta de esta API externa.

---

## 2. Patrones de Diseño Aplicados (Lógica del Servidor)

Para mitigar estos problemas, se implementaron soluciones puras en TypeScript aplicando tres categorías distintas de patrones de diseño, restringiendo su uso estrictamente a la lógica del servidor:

### A. Patrón Creacional: Factory (Fábrica)

- **Ubicación:** `src/posts/posts.factory.ts`
- **Solución:** Se delegó la instanciación compleja de `PostEntity` a la clase `PostFactory`. Toda la lógica de extracción de tags, cálculo de `relevanceScore` y mapeo de metadatos del _feed_ fue removida del controlador y centralizada en esta fábrica.
- **Impacto:** Cumple con SRP al aislar las reglas de construcción de entidades de presentación.
### Diagrama de Clases
Este diagrama muestra la estructura estática del módulo, ilustrando cómo el cliente (`NotificacionesService`) depende de la abstracción (`Notificacion`) y de la fábrica (`NotificacionFactory`), manteniéndose desacoplado de las implementaciones concretas.
<img width="1041" height="622" alt="DDclases" src="https://github.com/user-attachments/assets/fd7303de-a25c-4745-98d8-946c0952a0a6" />

### 🔄 Diagrama de Secuencia

Este diagrama describe el flujo dinámico cuando se solicita el envío de una alerta, demostrando cómo la fábrica intercepta la creación del objeto en tiempo de ejecución.
<img width="1320" height="550" alt="DDsecuencia" src="https://github.com/user-attachments/assets/6e2efa78-0e85-4330-8f3e-dbb09ad61a54" />


### Descripción de Componentes e Infraestructura
El patrón se divide en cuatro componentes clave ubicados en la ruta `src/notificaciones/`:

- **El Producto (`interfaces/notificacion.interface.ts`):** Define la interfaz `Notificacion` con el método abstracto `enviar`. Actúa como el contrato unificado del sistema.
- **Los Productos Concretos (`estrategias/`):** Clases `EmailNotificacion` y `WhatsappNotificacion`. Implementan de manera independiente la infraestructura técnica requerida para procesar y despachar los mensajes según su naturaleza.
- **El Creador (`notificacion.factory.ts`):** Clase `NotificacionFactory` que expone el método fábrica estático `crearCanal`. Centraliza las sentencias condicionales de instanciación evaluando el parámetro recibido en tiempo de ejecución.
- **El Servicio Cliente (`notificaciones.service.ts`):** Componente inyectable que encapsula la interacción con la fábrica y ejecuta los métodos del contrato abstracto, sirviendo como pasarela limpia para el resto de los módulos del servidor.

### Justificación de Diseño y Arquitectura

- **Desacoplamiento mediante Inversión de Dependencias:** El cliente (`NotificacionesService`) ya no depende de constructores directos (`new EmailNotificacion()`). Al depender exclusivamente de la interfaz abstracta, se reduce drásticamente el acoplamiento entre los componentes del sistema.
- **Extensibilidad bajo el Principio Abierto/Cerrado (OCP):** El código base está protegido contra modificaciones críticas. Si las necesidades del negocio exigen incorporar nuevos canales (como mensajería SMS, Telegram o notificaciones Push), solo se requiere codificar la nueva estrategia y registrarla en el switch de la fábrica. Toda la lógica de negocio consumidora permanecerá intacta.
- **Aislamiento de Responsabilidades (SRP):** La lógica asociada a discernir *cómo* y *cuándo* se inicializa un canal específico fue removida de las capas de servicio y encapsulada estrictamente en la fábrica creacional.
- **Modularidad para Integración en Repositorio:** El desarrollo se estructuró de forma encapsulada en su propio módulo (`NotificacionesModule`), permitiendo una integración limpia a través del árbol de directorios global y el mapeo de alias de rutas, minimizando la probabilidad de generar conflictos en el control de versiones al trabajar en paralelo con otros miembros del equipo.
### B. Patrón Estructural: Adapter (Adaptador)

- **Ubicación:** `src/posts/moderation.adapter.ts`
- **Solución:** Se creó la interfaz `ModernModerator` y su implementación concreta `LegacyModerationAdapter`. Este adaptador encapsula las respuestas impredecibles del cliente antiguo y expone un único método semántico y tipado: `isBlocked(content: string): boolean`.
- **Impacto:** Protege al controlador de cambios en dependencias externas e inestables, reduciendo la complejidad ciclomática del endpoint a una única línea limpia.

### C. Patrón de Comportamiento: Observer (Observador Clásico)

- **Ubicación:** `src/posts/posts.observer.ts`
- **Solución:** Se diseñó una infraestructura nativa de Observer mediante interfaces (`InteractionObserver`) y un sujeto central (`PostSubject`). Los efectos secundarios de logging, notificaciones y recálculos de puntaje se desacoplaron en observadores independientes (`LogObserver`, `NotificationObserver`, `RecomputeObserver`).
  Para garantizar la Inversión de Dependencias (DIP), la instanciación de los observadores no utiliza la palabra clave new, sino que se delega al contenedor de Inyección de Dependencias (IoC) nativo de NestJS mediante el decorador @Injectable(). Esto permite que los observadores sean testeables y puedan recibir sus propias dependencias en el futuro.
- **Impacto:** El controlador ahora solo invoca a `this.postSubject.notify(...)`. Cumple al 100% con OCP; si el negocio exige un nuevo efecto (ej. auditoría o emails), basta con crear un nuevo observador e inscribirlo en el sujeto, sin alterar una sola línea del controlador existente.

---

## 3. Impacto en SOLID y Calidad de Código

| Principio                           | Estado Inicial                                                                                    | Estado Modificado con Patrones                                                                                             |
| :---------------------------------- | :------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **SRP** (Responsabilidad Única)     | El controlador manejaba persistencia, moderación, logs, notificaciones y formateo.                | El controlador solo delega. La moderación va al **Adapter**, la creación al **Factory** y las alertas al **Observer**.     |
| **OCP** (Abierto / Cerrado)         | Modificar o añadir un log/notificación obligaba a reescribir los métodos del controlador.         | El controlador está cerrado a modificaciones. El sistema está abierto a extenderse mediante nuevos observadores concretos. |
| **DIP** (Inversión de Dependencias) | El controlador dependía directamente de una implementación concreta e inestable de la API legacy. | El controlador depende de la abstracción del adaptador inyectado por NestJS.                                               |

Todos los checks de compilación de TypeScript (`nest build`) pasan exitosamente en verde y la infraestructura de documentación (`/docs`) se mantiene completamente operativa y aislada.

## 4. Diagrama de Clases (Arquitectura del Servidor)

```mermaid
classDiagram
    class PostsController {
        -postsService: PostsService
        -prisma: PrismaService
        -postSubject: PostSubject
        -moderationAdapter: LegacyModerationAdapter
        -postFactory: PostFactory
        +create(body: CreatePostDto)
        +getFeed(query: FeedQueryDto)
        +createComment(id: number, body: CreateCommentDto)
    }

    class PostSubject {
        -observers: InteractionObserver[]
        +attach(observer: InteractionObserver)
        +notify(payload: any)
    }

    class InteractionObserver {
        <<interface>>
        +update(payload: any)
    }

    class LegacyModerationAdapter {
        +isBlocked(content: string) boolean
    }

    class PostFactory {
        +createFeedEntity(post: any, mode: string) PostEntity
    }

    PostsController --> PostSubject : Utiliza (Observer)
    PostsController --> LegacyModerationAdapter : Utiliza (Adapter)
    PostsController --> PostFactory : Utiliza (Factory)
    PostSubject o-- InteractionObserver : Notifica a
    InteractionObserver <|.. LogObserver : Implementa
    InteractionObserver <|.. NotificationObserver : Implementa
    InteractionObserver <|.. RecomputeObserver : Implementa
```
