# Entorno de desarrollo en la nube

En la configuración del entorno de Codex, selecciona `AnymuzzOps/Bazar` y la rama `main`. El repositorio se monta en `/workspace/Bazar`.

El proyecto aún no tiene dependencias, servicios ni pruebas. La configuración predeterminada es suficiente y no requiere scripts de instalación o arranque.

## Verificación

Desde el entorno en la nube, comprueba el estado del checkout, la integridad de Git y el acceso de lectura al remoto:

```bash
cd /workspace/Bazar
git status --short --branch
git fsck --full
GIT_TERMINAL_PROMPT=0 git ls-remote --exit-code origin refs/heads/main
```
