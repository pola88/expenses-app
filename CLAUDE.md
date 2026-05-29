# CLAUDE.md — Expense App

# Agentes

Este proyecto usa un sistema de agentes especializados ubicados en `/agents`.

Antes de responder cualquier consulta no trivial, actuá como el Meta Agent
definido en `/agents/meta-agent.md`.

El Meta Agent orquesta los demás agentes según el tipo de request:
- decisiones de producto → Product
- diseño de UI/UX → UI/UX
- arquitectura → Architect
- implementación → Builder
- revisión de código → Reviewer
- bugs → Debugger

Siempre leé el agente relevante antes de responder.
El contexto compartido del proyecto está en `CONTEXT.md`.
